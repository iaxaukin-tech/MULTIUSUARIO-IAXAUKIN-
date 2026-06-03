import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with generous limit for screenshots
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Debug check endpoint
app.get("/api/config-check", (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2 || "";
  res.json({
    hasPrincipalKey: !!process.env.GEMINI_API_KEY,
    hasAlternativeKey: !!process.env.GEMINI_API_KEY2,
    hasActiveKey: !!geminiKey,
    keyLength: geminiKey.length,
    keyPrefix: geminiKey ? `${geminiKey.substring(0, 4)}...` : "none"
  });
});

// API Proxy route for Gemini Analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2 || "";
    if (!geminiKey || geminiKey.trim() === "" || geminiKey.includes("MY_GEMINI_API_KEY")) {
      console.error("[IA XAU KIN Server] Clave API de Gemini vacía o no válida en el entorno.");
      return res.status(400).json({
        error: "API_KEY_MISSING: La clave de API de Gemini no está configurada en los Secretos de AI Studio.",
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

    console.log("[IA XAU KIN Server] Inicializando llamada a Gemini con clave de longitud:", geminiKey.length);
    const genAI = new GoogleGenAI({ apiKey: geminiKey });
    
    const model = "gemini-3-flash-preview";
    
    const result = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: systemPrompt || "Actúa como analista financiero." },
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
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    if (result.text) {
      return res.json({ text: result.text });
    } else {
      return res.status(500).json({ error: "No se pudo generar el análisis. La respuesta de la IA está vacía." });
    }
  } catch (err: any) {
    console.error("[IA XAU KIN Server] Error durante el análisis:", err);
    const errorMessage = err.message || "Error desconocido al analizar el gráfico.";
    
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
      return res.status(429).json({
        error: "CRÉDITOS AGOTADOS: Tu saldo de Google AI Studio se ha terminado o has superado el límite de cuota. Por favor, recarga tus créditos en https://aistudio.google.com/app/billing"
      });
    }

    return res.status(500).json({
      error: `Error en el análisis de la IA: ${errorMessage}. Asegúrate de que la clave del API y la imagen sean válidas.`
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

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IA XAU KIN Server] Servidor backend escuchando en http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("[IA XAU KIN Server] Error al inicializar el servidor:", err);
});
