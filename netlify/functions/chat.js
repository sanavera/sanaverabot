// netlify/functions/chat.js
export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Falta 'message'." }) };
    }

    const GATEWAY_URL = "https://gateway.ai.cloudflare.com/v1/5b577fa788a8fb7277063ac8afc06c28/chat-vigi";
    const GATEWAY_TOKEN = process.env.CLOUDFLARE_API_TOKEN; // poné tu token del Gateway en Netlify

    // Prompt del sistema (ajustalo a gusto)
    const systemPrompt = `Sos Sebastián, asistente en seguridad privada (AR) y nuestra calculadora de sueldo.
Respondé breve, humano (tono WhatsApp). No cites leyes salvo que te lo pidan explícitamente.`;

    // ⚠️ Body **EN ARRAY** como pide el Gateway
    const payload = [
      {
        provider: "workers-ai",
        endpoint: "@cf/meta/llama-3.1-8b-instruct",
        query: {
          // mismo formato "messages" estilo OpenAI
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        }
      }
    ];

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GATEWAY_TOKEN}`, // token del Gateway
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    // Extraer texto robusto (según variante de respuesta)
    let reply = null;

    // Caso: array de respuestas del Gateway
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      // Algunas versiones devuelven la respuesta en: first.response.result.response
      reply =
        first?.response?.result?.response ||
        first?.response?.result?.output_text ||
        first?.result?.response ||
        first?.result?.output_text ||
        null;
    }

    // Caso: passthrough al formato de Workers AI (objeto)
    if (!reply) {
      reply =
        data?.result?.response ||
        data?.result?.output_text ||
        null;
    }

    // Si sigue sin texto, devolvé el JSON crudo para diagnosticar
    if (!reply || !String(reply).trim()) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: `Sin texto. JSON:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
        })
      };
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
