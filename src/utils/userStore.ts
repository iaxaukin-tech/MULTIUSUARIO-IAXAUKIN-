import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  runTransaction,
  query,
  where,
  orderBy,
  deleteField
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, ActivationCode, SubscriptionPlan, SubscriptionStatus } from '../types';

export const userStore = {
  // Sync a direct Google Sign-in or email-registered user to database
  async syncGoogleUser(firebaseUser: any, customUsername?: string, referredBy?: string): Promise<User> {
    const docRef = doc(db, 'users', firebaseUser.uid);
    const path = `users/${firebaseUser.uid}`;
    
    try {
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        let needsUpdate = false;
        const updatePayload: Partial<User> = {};
        
        // Ensure email verification is aligned (some users verify later)
        if (existingData.email !== firebaseUser.email) {
          updatePayload.email = firebaseUser.email || '';
          needsUpdate = true;
        }

        // If it's our direct developer owner email, auto-bootstrap to ADMIN if not already
        if (firebaseUser.email?.toLowerCase() === 'iaxaukin@gmail.com' && existingData.role !== 'ADMIN') {
          updatePayload.role = 'ADMIN';
          updatePayload.status = 'ACTIVE';
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(docRef, updatePayload);
          return { ...existingData, ...updatePayload } as User;
        }

        return existingData as User;
      } else {
        // Bootstrap new user
        // Personalised Admin check for the actual user
        const isOwnerAdmin = firebaseUser.email?.toLowerCase() === 'iaxaukin@gmail.com';
        
        const cleanUsername = customUsername 
          ? customUsername.trim().replace(/\s+/g, '_').toLowerCase()
          : (firebaseUser.displayName?.replace(/\s+/g, '_').toLowerCase() || `op_${Math.random().toString(36).substring(2, 7)}`);

        const pendingRef = sessionStorage.getItem('xau_kin_pending_referral') || localStorage.getItem('xau_kin_pending_referral') || '';

        const newUser: User = {
          id: firebaseUser.uid,
          username: cleanUsername,
          email: firebaseUser.email || '',
          role: isOwnerAdmin ? 'ADMIN' : 'USER',
          plan: isOwnerAdmin ? 'INSTITUTIONAL' : 'RETAIL', // Default to RETAIL on registration
          status: isOwnerAdmin ? 'ACTIVE' : 'INACTIVE',
          joinedAt: new Date().toISOString(),
          referredBy: (referredBy || pendingRef || '').trim().toLowerCase(),
          referralCode: cleanUsername, // Default is their own username!
        };

        await setDoc(docRef, newUser);
        // Track the reserved username to enforce uniqueness securely
        await setDoc(doc(db, 'usernames', cleanUsername), { uid: firebaseUser.uid });
        return newUser;
      }
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Get all registered users from Firestore
  async getUsers(): Promise<User[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const results: User[] = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data() as User);
      });
      return results;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // Check if a username is already taken
  async isUsernameTaken(username: string): Promise<boolean> {
    const clean = username.trim().toLowerCase();
    const path = `usernames/${clean}`;
    try {
      const docSnap = await getDoc(doc(db, 'usernames', clean));
      return docSnap.exists();
    } catch (err) {
      return handleFirestoreError(err, OperationType.GET, path);
    }
  },

  // Submit payment hash
  async submitPaymentReceipt(userId: string, targetPlan: SubscriptionPlan, txHash: string): Promise<User> {
    const path = `users/${userId}`;
    const docRef = doc(db, 'users', userId);
    try {
      const payload = {
        paymentReceiptUrl: txHash,
        status: 'PENDING_APPROVAL' as SubscriptionStatus,
        plan: targetPlan
      };
      await updateDoc(docRef, payload);
      const snap = await getDoc(docRef);
      return snap.data() as User;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Admin updates status directly
  async updateUserStatus(userId: string, plan: SubscriptionPlan, status: SubscriptionStatus, days: number = 30): Promise<User> {
    const path = `users/${userId}`;
    const docRef = doc(db, 'users', userId);
    try {
      const payload: Partial<User> = {
        plan,
        status
      };

      if (status === 'ACTIVE') {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        payload.expiresAt = expiry.toISOString();
        payload.isTelemetryLimited = deleteField() as any;
        payload.allowedTotalAnalyses = deleteField() as any;
      } else {
        (payload as any).expiresAt = deleteField();
      }

      await updateDoc(docRef, payload);
      const snap = await getDoc(docRef);
      return snap.data() as User;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Activate profile with a voucher code inside a Firestore transaction!
  async activateWithCode(userId: string, codeStr: string): Promise<User> {
    const cleanCode = codeStr.trim().toUpperCase();
    const userDocRef = doc(db, 'users', userId);
    const codeDocRef = doc(db, 'activationCodes', cleanCode);

    try {
      // Execute as transactional atomicity to prevent double-claiming
      const updatedUser = await runTransaction(db, async (transaction) => {
        const codeSnap = await transaction.get(codeDocRef);
        if (!codeSnap.exists()) {
          throw new Error("El código de membresía no existe.");
        }

        const codeData = codeSnap.data() as ActivationCode;
        if (codeData.isUsed) {
          throw new Error("Este código ya ha sido reclamado.");
        }

        const userSnap = await transaction.get(userDocRef);
        if (!userSnap.exists()) {
          throw new Error("Operador no registrado.");
        }

        const userData = userSnap.data() as User;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + codeData.durationDays);

        // Claim code update
        transaction.update(codeDocRef, {
          isUsed: true,
          usedBy: userData.username
        });

        // Activate user update
        const userUpdates: Partial<User> = {
          status: 'ACTIVE',
          plan: codeData.plan,
          expiresAt: expiry.toISOString(),
          isTelemetryLimited: codeData.isTelemetryLimited || false,
          allowedTotalAnalyses: codeData.allowedTotalAnalyses || null,
          totalAnalysesCount: userData.totalAnalysesCount || 0
        };
        transaction.update(userDocRef, userUpdates);

        return { ...userData, ...userUpdates } as User;
      });

      return updatedUser;
    } catch (err: any) {
      // Throw formatted or bubble actual error message
      if (err.message && (err.message.includes("código") || err.message.includes("Operador") || err.message.includes("ya ha sido"))) {
        throw err;
      }
      return handleFirestoreError(err, OperationType.WRITE, `users/${userId}/transactions`);
    }
  },

  // Fetch all codes
  async getCodes(): Promise<ActivationCode[]> {
    const path = 'activationCodes';
    try {
      const q = query(collection(db, 'activationCodes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const results: ActivationCode[] = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data() as ActivationCode);
      });
      return results;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // Auto-provision default coupon KINFREE30 if missing for easy testing/evaluation
  async ensureDefaultCoupon(): Promise<void> {
    const path = 'activationCodes/KINFREE30';
    const docRef = doc(db, 'activationCodes', 'KINFREE30');
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        const defaultCode: ActivationCode = {
          code: 'KINFREE30',
          plan: 'PRO',
          durationDays: 30,
          isUsed: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, defaultCode);
      }
    } catch (err) {
      console.error("Failed to ensure default coupon:", err);
    }
  },

  // Admin coupon key generator
  async generateCode(
    plan: SubscriptionPlan, 
    durationDays: number, 
    isTelemetryLimited?: boolean, 
    allowedTotalAnalyses?: number
  ): Promise<ActivationCode> {
    const prefix = isTelemetryLimited ? 'TRLS' : plan.substring(0, 4).toUpperCase();
    const durationLabel = isTelemetryLimited ? `${allowedTotalAnalyses}TEL` : `${durationDays}D`;
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codeString = `${prefix}_${durationLabel}_${randomHex}`;
    
    const path = `activationCodes/${codeString}`;
    const docRef = doc(db, 'activationCodes', codeString);

    const newCode: ActivationCode = {
      code: codeString,
      plan,
      durationDays,
      isUsed: false,
      createdAt: new Date().toISOString()
    };

    if (isTelemetryLimited) {
      newCode.isTelemetryLimited = true;
      newCode.allowedTotalAnalyses = allowedTotalAnalyses;
    }

    try {
      await setDoc(docRef, newCode);
      return newCode;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Save generated analysis report to History & update user's lastAnalysisAt
  async recordAnalysis(userId: string, mimeType: string, reportText: string): Promise<void> {
    const dateStr = new Date().toISOString();
    const today = new Date();
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const userDocRef = doc(db, 'users', userId);
    
    // Create random analysis log path
    const analysisId = `anly_${Math.random().toString(36).substring(2, 9)}`;
    const analysisDocRef = doc(db, 'analysisHistory', analysisId);

    try {
      await setDoc(analysisDocRef, {
        id: analysisId,
        userId: userId,
        createdAt: dateStr,
        imageMimeType: mimeType,
        analysisText: reportText
      });

      // Get current user data to check daily limit cache safely
      const userSnap = await getDoc(userDocRef);
      let newCount = 1;
      let newTotalCount = 1;
      let userData: any = null;
      if (userSnap.exists()) {
        userData = userSnap.data();
        if (userData.dailyUsage && userData.dailyUsage.date === localDateStr) {
          newCount = (userData.dailyUsage.count || 0) + 1;
        }
        newTotalCount = (userData.totalAnalysesCount || 0) + 1;
      }

      await updateDoc(userDocRef, {
        lastAnalysisAt: dateStr,
        totalAnalysesCount: newTotalCount,
        dailyUsage: {
          date: localDateStr,
          count: newCount
        }
      });

      // Dispatch Webhook alerts asynchronously if integrations exist on user
      if (userData) {
        const username = userData.username || 'operador';
        // Non-blocking trigger so we do not freeze user interface
        (async () => {
          // Discord Webhook Dispatch
          if (userData.discordWebhookUrl) {
            try {
              await fetch(userData.discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: `📊 **IA XAU KIN — REPORTE DE MERCADO DISPATCHADO** (@${username})\n\n${reportText.slice(0, 1800)}${reportText.length > 1800 ? '...' : ''}`
                })
              });
            } catch (e) {
              console.warn("Discord Webhook transmission failed:", e);
            }
          }

          // Generic custom Webhook
          if (userData.webhookUrl) {
            try {
              await fetch(userData.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: "analysis_created",
                  username: username,
                  timestamp: new Date().toISOString(),
                  analysisText: reportText
                })
              });
            } catch (e) {
              console.warn("Custom Webhook transmission failed:", e);
            }
          }

          // Telegram Bot and Chat ID Channel Forwarder
          if (userData.telegramBotToken && userData.telegramChannelId) {
            try {
              const url = `https://api.telegram.org/bot${userData.telegramBotToken}/sendMessage`;
              await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: userData.telegramChannelId,
                  text: `📊 *IA XAU KIN — REPORTE DE MERCADO DISPATCHADO* (@${username})\n\n${reportText.slice(0, 3850)}${reportText.length > 3850 ? '...' : ''}`,
                  parse_mode: 'Markdown'
                })
              });
            } catch (e) {
              console.warn("Telegram Dispatch failed:", e);
            }
          }
        })().catch(err => console.error("Async webhook transmission thread error:", err));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `analysisHistory/${analysisId}`);
    }
  },

  // Get analysis logs for a user email
  async getUserAnalysisHistory(userId: string): Promise<any[]> {
    const path = 'analysisHistory';
    try {
      const q = query(
        collection(db, 'analysisHistory'), 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });
      return results;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // Get count of analysis logs created today (since midnight local time with ultra-high speed cached fallback)
  async getDailyAnalysisCount(userId: string): Promise<number> {
    const today = new Date();
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const startOfTodayIso = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.dailyUsage && userData.dailyUsage.date === localDateStr) {
          return userData.dailyUsage.count || 0;
        }
      }

      // Fallback fallback: if field not present or date is stale, fetch & recount to synchronize seamlessly
      const q = query(
        collection(db, 'analysisHistory'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      let count = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt && data.createdAt >= startOfTodayIso) {
          count++;
        }
      });

      // Maintain user document profile cache dynamically
      try {
        await updateDoc(userDocRef, {
          dailyUsage: {
            date: localDateStr,
            count: count
          }
        });
      } catch (cacheErr) {
        console.warn("[IA XAU KIN Cache] Gasto fallido al persistir caches de usos:", cacheErr);
      }

      return count;
    } catch (err) {
      console.error("Error calculating daily analysis count:", err);
      return 0;
    }
  },

  // Clean-up or suspend voucher
  async deleteCode(code: string): Promise<void> {
    const path = `activationCodes/${code}`;
    // For convenience in admin panel
    try {
      await setDoc(doc(db, 'activationCodes', code), { isUsed: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Get dynamic payment configuration or fallback to owner defaults
  async getPaymentConfig(): Promise<{ 
    usdtAddress: string; 
    binancePayId: string; 
    binanceEmail?: string; 
    customMessage?: string;
    usdtQrImage?: string;
    binanceQrImage?: string;
    paypalClientId?: string;
    paypalPlanIdBasic?: string;
    paypalPlanIdPro?: string;
  }> {
    const path = 'settings/payment';
    const fallback = {
      usdtAddress: 'TCWAFUsu2iuwkrQyATGKBjdSYczm2pVDGk', // Real owner address supplied in chat
      binancePayId: '1129008012',
      binanceEmail: 'pagos@iaxaukin.com',
      customMessage: 'Envía el monto neto exacto de tu plan. No cubrimos comisiones de retiro de exchanges externos. Tu licencia se activará tras confirmación manual.',
      usdtQrImage: '',
      binanceQrImage: '',
      paypalClientId: 'BAA-Qyr9jMnnpjjCeqy_wmkaWooAqWlZD_H63OIR9znYei195dD7E3Eq0sjapP7OHxH6UmADRjn9wZf3Vc',
      paypalPlanIdBasic: 'P-6U703114N8775584UNIU4K7Y',
      paypalPlanIdPro: 'P-022706311G490222MNIU4USY'
    };
    
    try {
      const snap = await getDoc(doc(db, 'settings', 'payment'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          usdtAddress: data.usdtAddress || fallback.usdtAddress,
          binancePayId: data.binancePayId || fallback.binancePayId,
          binanceEmail: data.binanceEmail || fallback.binanceEmail,
          customMessage: data.customMessage || fallback.customMessage,
          usdtQrImage: data.usdtQrImage || '',
          binanceQrImage: data.binanceQrImage || '',
          paypalClientId: data.paypalClientId || fallback.paypalClientId,
          paypalPlanIdBasic: data.paypalPlanIdBasic || fallback.paypalPlanIdBasic,
          paypalPlanIdPro: data.paypalPlanIdPro || fallback.paypalPlanIdPro,
        };
      }
      return fallback;
    } catch (err) {
      console.warn("[IA XAU KIN DB] Error fetching payment config, using fallback defaults:", err);
      return fallback;
    }
  },

  // Update dynamic payment configuration (admin restricted)
  async updatePaymentConfig(config: { 
    usdtAddress: string; 
    binancePayId: string; 
    binanceEmail?: string; 
    customMessage?: string;
    usdtQrImage?: string;
    binanceQrImage?: string;
    paypalClientId?: string;
    paypalPlanIdBasic?: string;
    paypalPlanIdPro?: string;
  }): Promise<void> {
    const path = 'settings/payment';
    try {
      await setDoc(doc(db, 'settings', 'payment'), {
        usdtAddress: config.usdtAddress.trim(),
        binancePayId: config.binancePayId.trim(),
        binanceEmail: config.binanceEmail?.trim() || '',
        customMessage: config.customMessage?.trim() || '',
        usdtQrImage: config.usdtQrImage || '',
        binanceQrImage: config.binanceQrImage || '',
        paypalClientId: config.paypalClientId?.trim() || '',
        paypalPlanIdBasic: config.paypalPlanIdBasic?.trim() || '',
        paypalPlanIdPro: config.paypalPlanIdPro?.trim() || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Update institutional configurations (affiliate code & integration webhooks)
  async updateInstitutionalConfig(
    userId: string,
    config: {
      referralCode?: string;
      webhookUrl?: string;
      telegramChannelId?: string;
      telegramBotToken?: string;
      discordWebhookUrl?: string;
    }
  ): Promise<User> {
    const path = `users/${userId}`;
    const docRef = doc(db, 'users', userId);
    try {
      const payload: Partial<User> = {};
      if (config.referralCode !== undefined) payload.referralCode = config.referralCode.trim().toLowerCase();
      if (config.webhookUrl !== undefined) payload.webhookUrl = config.webhookUrl.trim();
      if (config.telegramChannelId !== undefined) payload.telegramChannelId = config.telegramChannelId.trim();
      if (config.telegramBotToken !== undefined) payload.telegramBotToken = config.telegramBotToken.trim();
      if (config.discordWebhookUrl !== undefined) payload.discordWebhookUrl = config.discordWebhookUrl.trim();

      await updateDoc(docRef, payload);
      const snap = await getDoc(docRef);
      return snap.data() as User;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Fetch all users referred by an institutional partner's code
  async getReferredUsers(referralCode: string): Promise<User[]> {
    const path = 'users';
    try {
      const cleanRefCode = referralCode.trim().toLowerCase();
      const q = query(
        collection(db, 'users'),
        where('referredBy', '==', cleanRefCode)
      );
      const querySnapshot = await getDocs(q);
      const results: User[] = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data() as User);
      });
      return results;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // Submit user onboarding questionnaire
  async submitOnboarding(
    userId: string, 
    data: { 
      source: string; 
      goldExperience?: string; 
      primaryGoal?: string; 
      retentionPreference?: string;
      experience?: string;
      goldKnowledge?: string;
      goals?: string[];
      retentionFactors?: string[];
    }
  ): Promise<User> {
    const path = `users/${userId}`;
    const docRef = doc(db, 'users', userId);
    try {
      const payload = {
        onboardingCompleted: true,
        onboardingData: {
          ...data,
          completedAt: new Date().toISOString()
        }
      };
      await updateDoc(docRef, payload);
      const snap = await getDoc(docRef);
      return snap.data() as User;
    } catch (err) {
      return handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Submit a user suggestion/feedback
  async submitSuggestion(
    userId: string,
    username: string,
    email: string,
    suggestion: { title: string; description: string; category: string }
  ): Promise<void> {
    const id = `sugg_${Math.random().toString(36).substring(2, 9)}`;
    const path = `suggestions/${id}`;
    try {
      await setDoc(doc(db, 'suggestions', id), {
        id,
        userId,
        username,
        email,
        title: suggestion.title.trim(),
        description: suggestion.description.trim(),
        category: suggestion.category,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Get all suggestions (admin restricted)
  async getSuggestions(): Promise<any[]> {
    const path = 'suggestions';
    try {
      const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });
      return results;
    } catch (err) {
      return handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // Update suggestion status
  async updateSuggestionStatus(id: string, status: 'PENDING' | 'REVIEWED' | 'IMPLEMENTED'): Promise<void> {
    const path = `suggestions/${id}`;
    try {
      await updateDoc(doc(db, 'suggestions', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};
