import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./src/lib/firebase";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with generous limit for screenshots
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Dynamic favicon downloader from ImgBB link
async function downloadFavicon() {
  const targetDir = path.join(process.cwd(), "src", "assets", "images");
  const targetPath = path.join(targetDir, "favicon_custom.png");

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    console.log("[IA XAU KIN Favicon] Fetching ImgBB page to extract raw image link...");
    const res = await fetch("https://ibb.co/T3L5yy0");
    if (!res.ok) throw new Error(`HTTP page response ${res.status}`);
    const html = await res.text();
    
    // Find og:image or similar meta tag in the HTML (ImgBB embeds this in the header metadata)
    const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || 
                  html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i) ||
                  html.match(/<link\s+rel="image_src"\s+href="([^"]+)"/i);
                  
    if (match && match[1]) {
      const directUrl = match[1];
      console.log("[IA XAU KIN Favicon] Found direct image URL:", directUrl);
      
      console.log("[IA XAU KIN Favicon] Downloading direct image...");
      const imgRes = await fetch(directUrl);
      if (!imgRes.ok) throw new Error(`HTTP image response ${imgRes.status}`);
      
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      fs.writeFileSync(targetPath, buffer);
      console.log("[IA XAU KIN Favicon] Successfully saved custom favicon to:", targetPath);
    } else {
      console.warn("[IA XAU KIN Favicon] Could not find og:image in ImgBB page. Trying backup parser...");
      const fallbackSrcMatch = html.match(/src="(https:\/\/i\.ibb\.co\/[^"]+)"/i);
      if (fallbackSrcMatch && fallbackSrcMatch[1]) {
        const directUrl = fallbackSrcMatch[1];
        console.log("[IA XAU KIN Favicon] Found direct image URL via backup match:", directUrl);
        const imgRes = await fetch(directUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
        console.log("[IA XAU KIN Favicon] Successfully saved custom favicon via backup to:", targetPath);
      } else {
        throw new Error("No image source found in the page HTML.");
      }
    }
  } catch (error) {
    console.error("[IA XAU KIN Favicon] Failed to download custom favicon:", error);
    // Ensure we have a valid fallback file so Vite does not crash/throw errors during compilation
    if (!fs.existsSync(targetPath)) {
      const defaultIconPath = path.join(targetDir, "favicon_1780588727337.png");
      if (fs.existsSync(defaultIconPath)) {
        fs.copyFileSync(defaultIconPath, targetPath);
        console.log("[IA XAU KIN Favicon] Placed default generated favicon as placeholder.");
      } else {
        // Create an empty file to prevent compilation crash if all else fails
        fs.writeFileSync(targetPath, "");
        console.log("[IA XAU KIN Favicon] Created empty placeholder file.");
      }
    }
  }
}

// Helper to select all valid Gemini API Keys from environment
function getAllGeminiApiKeys(): string[] {
  const keys: string[] = [];

  const isRealKey = (k: string) => {
    if (!k) return false;
    // Real keys typically start with AIza
    if (k.startsWith("AIza")) return true;
    // Reject known placeholders or empty strings
    if (k.includes("MY_GEMINI_API_KEY") || k.includes("Default") || k.includes("placeholder") || k === "undefined" || k === "null") {
      return false;
    }
    // If it is long enough and not a placeholder, assume it is real
    return k.trim().length > 20;
  };

  // Inspect environment variables for any entries starting with GEMINI_API_KEY
  const envKeys = Object.keys(process.env).filter(k => k.startsWith("GEMINI_API_KEY"));
  
  // Sort them so GEMINI_API_KEY is first, then GEMINI_API_KEY2, etc. (using numeric natural sorting)
  envKeys.sort((a, b) => {
    if (a === "GEMINI_API_KEY") return -1;
    if (b === "GEMINI_API_KEY") return 1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  for (const envKey of envKeys) {
    const val = (process.env[envKey] || "").trim();
    if (isRealKey(val)) {
      keys.push(val);
    }
  }

  // Backup fallback if we found no 'real' keys but have custom definitions
  if (keys.length === 0) {
    for (const envKey of envKeys) {
      const val = (process.env[envKey] || "").trim();
      if (val && !val.includes("MY_GEMINI_API_KEY")) {
        keys.push(val);
      }
    }
  }

  return keys;
}

// Get the Gemini API Key stored in Firestore settings/gemini securely on the server
async function getFirestoreGeminiApiKey(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, "settings", "gemini"));
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.apiKey && typeof data.apiKey === "string") {
        const val = data.apiKey.trim();
        if (val && (val.startsWith("AIza") || val.startsWith("AQ.")) && val.length > 20) {
          return val;
        }
      }
    }
  } catch (err) {
    console.warn("[IA XAU KIN Server] No se pudo obtener la clave API de Firestore settings/gemini:", err);
  }
  return null;
}

// Debug check endpoint
app.get("/api/config-check", (req, res) => {
  const keys = getAllGeminiApiKeys();
  const envKeysFound = Object.keys(process.env).filter(k => k.startsWith("GEMINI_API_KEY"));
  
  res.json({
    hasActiveKey: keys.length > 0,
    activeKeysCount: keys.length,
    activeKeysDetected: envKeysFound,
    primaryKeyLength: keys[0] ? keys[0].length : 0,
    primaryKeyPrefix: keys[0] ? `${keys[0].substring(0, 4)}...` : "none",
    detectedType: keys[0]?.startsWith("AIza") ? "Real API Key (AIza)" : "Fallback/Placeholder"
  });
});

// API Proxy route for Gemini Analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const headerKey = req.headers["x-gemini-key"] || req.headers["X-Gemini-Key"];
    
    // Choose the API keys we will rotate through
    let candidateKeys: string[] = [];
    
    // 1. Add key supplied from header (if any)
    if (headerKey && typeof headerKey === "string" && headerKey.trim() !== "") {
      candidateKeys.push(headerKey.trim());
    }
    
    // 2. Add key stored dynamically in Firestore settings/gemini as a primary secure database fallback
    const dbKey = await getFirestoreGeminiApiKey();
    if (dbKey) {
      candidateKeys.push(dbKey);
    }
    
    // 3. Add environment keys
    candidateKeys = candidateKeys.concat(getAllGeminiApiKeys());

    // Deduplicate candidate keys
    candidateKeys = Array.from(new Set(candidateKeys));

    if (candidateKeys.length === 0) {
      console.error("[IA XAU KIN Server] Ninguna clave API de Gemini válida en el entorno.");
      return res.status(400).json({
        error: "API_KEY_MISSING: La clave de API de Gemini no está configurada en los Secretos de AI Studio ni se ha proporcionado una clave manual.",
        debugInfo: {
          hasPrincipal: !!process.env.GEMINI_API_KEY,
          hasAlternative: !!process.env.GEMINI_API_KEY2
        }
      });
    }

    const { mimeType, base64Data, systemPrompt } = req.body;

    if (!mimeType || !base64Data) {
      return res.status(400).json({ error: "Faltan datos de la imagen o tipo mime." });
    }

    const model = "gemini-3.5-flash";
    let lastError: any = null;
    let completedText = "";
    
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Iterate through API key rotation pool
    for (let i = 0; i < candidateKeys.length; i++) {
      const activeKey = candidateKeys[i];
      console.log(`[IA XAU KIN Server] Intentando análisis con clave ${i + 1}/${candidateKeys.length} (longitud: ${activeKey.length})`);
      
      let attempts = 0;
      const maxAttempts = 2;
      let keySuccess = false;

      while (attempts < maxAttempts) {
        attempts++;
        // If the first attempt fails due to transient or capacity errors, we fall back to gemini-2.5-flash for maximum resilience
        const currentModel = (attempts > 1) ? "gemini-2.5-flash" : model;
        try {
          const genAI = new GoogleGenAI({ apiKey: activeKey });
          
          const result = await genAI.models.generateContent({
            model: currentModel,
            contents: [
              {
                parts: [
                  { text: systemPrompt || "Actúa como analista financiero profesional de mercados." },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  },
                  { text: "Ejecutar modelado cuantitativo inmediato sobre esta telemetría visual." }
                ]
              }
            ],
            config: {
              temperature: 0.15
            }
          });

          if (result.text) {
            completedText = result.text;
            console.log(`[IA XAU KIN Server] Sincronización exitosa utilizando la clave API ${i + 1}/${candidateKeys.length} con modelo ${currentModel} (Intento ${attempts}/${maxAttempts})`);
            keySuccess = true;
            break; // Break inner loop
          } else {
            throw new Error("Respuesta vacía recibida de Gemini.");
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || JSON.stringify(err);
          console.error(`[IA XAU KIN Server] Fallo de clave API ${i + 1}/${candidateKeys.length} con modelo ${currentModel} en intento ${attempts}/${maxAttempts}:`, errMsg);
          
          const isTransient = errMsg.includes("503") || 
                              errMsg.includes("demand") || 
                              errMsg.includes("UNAVAILABLE") || 
                              errMsg.includes("500") ||
                              errMsg.includes("429") ||
                              errMsg.includes("RESOURCE_EXHAUSTED") ||
                              errMsg.includes("404") ||
                              errMsg.includes("not found");

          if (isTransient && attempts < maxAttempts) {
            const delay = 800 * attempts;
            console.log(`[IA XAU KIN Server] Inconveniente de alta demanda, cuota o compatibilidad detectado. Esperando ${delay}ms de enfriamiento y activando modelo de respaldo antes del intento ${attempts + 1}/${maxAttempts}...`);
            await sleep(delay);
          } else {
            // Unrecoverable on this key (e.g. invalid key) or reached max attempts
            break;
          }
        }
      }

      if (keySuccess) {
        break; // Succeeded! Break key rotation loop.
      } else {
        if (i < candidateKeys.length - 1) {
          console.log("[IA XAU KIN Server] Intentando reintento con la siguiente clave de API tras 500ms de retraso...");
          await sleep(500);
        }
      }
    }

    if (completedText) {
      return res.json({ text: completedText });
    }

    // Handled if ALL keys fail
    console.error("[IA XAU KIN Server] Todas las claves de API proporcionadas fallaron.");
    const errorMessage = lastError?.message || "Error desconocido al analizar el gráfico con Gemini.";
    
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
      return res.status(429).json({
        error: "CRÉDITOS AGOTADOS: Todas las llaves API configuradas han excedido su cuota o saldo. Por favor, agregue créditos en Google AI Studio o pruebe otra clave de API."
      });
    }

    return res.status(500).json({
      error: `Error en el análisis de la IA: ${errorMessage}. Asegúrese de que sus claves API son válidas y activas.`
    });

  } catch (err: any) {
    console.error("[IA XAU KIN Server] Error crítico general en proxy endpoint:", err);
    return res.status(500).json({
      error: `Error interno de servidor: ${err.message || err}`
    });
  }
});

// PayPal Webhooks endpoint to automatically renew user subscriptions
app.post("/api/paypal/webhook", async (req, res) => {
  const event = req.body;
  console.log(`[PayPal Webhook] Recibido Evento: ${event.event_type}`, JSON.stringify(event));

  try {
    let subscriptionId = "";
    
    // Extract subscriptionId based on event type and structure
    if (event.resource && event.resource.billing_agreement_id) {
      // Occurs during recurring monthly payments: PAYMENT.SALE.COMPLETED
      subscriptionId = event.resource.billing_agreement_id;
    } else if (event.resource && event.resource.id && event.event_type && event.event_type.startsWith("BILLING.SUBSCRIPTION.")) {
      // Occurs during status changes: BILLING.SUBSCRIPTION.ACTIVATED, CANCELLED, EXPIRED
      subscriptionId = event.resource.id;
    }

    if (!subscriptionId) {
      console.log("[PayPal Webhook] No se encontró ID de acuerdo de facturación/suscripción en este evento.");
      return res.json({ received: true, message: "No subscription id found in event payload." });
    }

    console.log(`[PayPal Webhook] Buscando suscriptor asociado en Firestore para ID: ${subscriptionId}`);

    // Query across users collection for paymentReceiptUrl containing the subscriptionId
    const usersColl = collection(db, "users");
    const q1 = query(usersColl, where("paymentReceiptUrl", "==", `PAYPAL_SUSB_ID:${subscriptionId}`));
    const snap1 = await getDocs(q1);
    
    let userDocToUpdate: any = null;
    snap1.forEach((d) => {
      userDocToUpdate = { id: d.id, ...d.data() };
    });

    if (!userDocToUpdate) {
      // Alternately query for raw subscriptionId
      const q2 = query(usersColl, where("paymentReceiptUrl", "==", subscriptionId));
      const snap2 = await getDocs(q2);
      snap2.forEach((d) => {
        userDocToUpdate = { id: d.id, ...d.data() };
      });
    }

    if (!userDocToUpdate) {
      console.warn(`[PayPal Webhook] Operador no encontrado para ID de suscripción: ${subscriptionId}`);
      return res.status(404).json({ error: `No se encontró usuario con la suscripción PayPal ID: ${subscriptionId}` });
    }

    console.log(`[PayPal Webhook] Coincidencia encontrada: ${userDocToUpdate.username} (ID: ${userDocToUpdate.id})`);

    const userDocRef = doc(db, "users", userDocToUpdate.id);

    if (event.event_type === "PAYMENT.SALE.COMPLETED") {
      // Success recurring renewal payment! Extend duration automatically by another 30 days
      const currentExpiry = userDocToUpdate.expiresAt ? new Date(userDocToUpdate.expiresAt) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + 30);

      await updateDoc(userDocRef, {
        status: "ACTIVE",
        expiresAt: newExpiry.toISOString(),
        plan: userDocToUpdate.plan || "PRO"
      });

      console.log(`[PayPal Webhook] Renovación automática concretada para ${userDocToUpdate.username}. Vence: ${newExpiry.toISOString()}`);
    } else if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED" || event.event_type === "BILLING.SUBSCRIPTION.EXPIRED") {
      // Card cancelled or expired on PayPal
      await updateDoc(userDocRef, {
        status: "EXPIRED"
      });
      console.log(`[PayPal Webhook] Suscripción cancelada de forma automática para ${userDocToUpdate.username}.`);
    } else if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      // Enrolled subscription activated initially
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 30);

      await updateDoc(userDocRef, {
        status: "ACTIVE",
        expiresAt: newExpiry.toISOString()
      });
      console.log(`[PayPal Webhook] Suscripción inscrita correctamente y activada para ${userDocToUpdate.username}.`);
    }

    return res.json({ success: true, username: userDocToUpdate.username, status: "updated" });
  } catch (err: any) {
    console.error("[PayPal Webhook] Error crítico de procesamiento:", err);
    return res.status(500).json({ error: `Fallo al procesar Webhook: ${err.message || err}` });
  }
});

// Configure Vite or Static Files
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(async () => {
  await downloadFavicon();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IA XAU KIN Server] Servidor backend escuchando en http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("[IA XAU KIN Server] Error al inicializar el servidor:", err);
});
