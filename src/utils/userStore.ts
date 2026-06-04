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
  async syncGoogleUser(firebaseUser: any, customUsername?: string): Promise<User> {
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

        const newUser: User = {
          id: firebaseUser.uid,
          username: cleanUsername,
          email: firebaseUser.email || '',
          role: isOwnerAdmin ? 'ADMIN' : 'USER',
          plan: isOwnerAdmin ? 'INSTITUTIONAL' : 'PRO', // Grant PRO of default on registration
          status: isOwnerAdmin ? 'ACTIVE' : 'INACTIVE',
          joinedAt: new Date().toISOString(),
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
          expiresAt: expiry.toISOString()
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
  async generateCode(plan: SubscriptionPlan, durationDays: number): Promise<ActivationCode> {
    const prefix = plan.substring(0, 4).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codeString = `${prefix}_${durationDays}D_${randomHex}`;
    
    const path = `activationCodes/${codeString}`;
    const docRef = doc(db, 'activationCodes', codeString);

    const newCode: ActivationCode = {
      code: codeString,
      plan,
      durationDays,
      isUsed: false,
      createdAt: new Date().toISOString()
    };

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
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.dailyUsage && userData.dailyUsage.date === localDateStr) {
          newCount = (userData.dailyUsage.count || 0) + 1;
        }
      }

      await updateDoc(userDocRef, {
        lastAnalysisAt: dateStr,
        dailyUsage: {
          date: localDateStr,
          count: newCount
        }
      });
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
  }
};
