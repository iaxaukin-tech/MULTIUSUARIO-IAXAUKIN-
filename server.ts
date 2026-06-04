import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

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
    if (headerKey && typeof headerKey === "string" && headerKey.trim() !== "") {
      candidateKeys.push(headerKey.trim());
      // Let environment-defined keys act as fallback options
      candidateKeys = candidateKeys.concat(getAllGeminiApiKeys());
    } else {
      candidateKeys = getAllGeminiApiKeys();
    }

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

    // Iterate through API key rotation pool
    for (let i = 0; i < candidateKeys.length; i++) {
      const activeKey = candidateKeys[i];
      console.log(`[IA XAU KIN Server] Intentando análisis con clave ${i + 1}/${candidateKeys.length} (longitud: ${activeKey.length})`);
      
      try {
        const genAI = new GoogleGenAI({ apiKey: activeKey });
        
        const result = await genAI.models.generateContent({
          model: model,
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
          console.log(`[IA XAU KIN Server] Sincronización exitosa utilizando la clave API ${i + 1}/${candidateKeys.length}`);
          break; // Succeeded! Break out of loop.
        } else {
          throw new Error("Respuesta vacía recibida de Gemini.");
        }
      } catch (err: any) {
        lastError = err;
        console.error(`[IA XAU KIN Server] Fallo al usar clave API ${i + 1}/${candidateKeys.length}:`, err.message || err);
        if (i < candidateKeys.length - 1) {
          console.log("[IA XAU KIN Server] Intentando reintento con la siguiente clave de API...");
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
