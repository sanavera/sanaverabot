// netlify/functions/chat.js
export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Falta 'message'." }) };
    }

    const GATEWAY_URL = "https://gateway.ai.cloudflare.com/v1/5b577fa788a8fb7277063ac8afc06c28/chat-vigi";
    // Usa tu variable real en Netlify:
    const GATEWAY_TOKEN =
      process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_KEY;

    if (!GATEWAY_TOKEN) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: "No hay token (CLOUDFLARE_API_TOKEN) en Netlify." })
      };
    }

    const systemPrompt = `Sos Sebastián, asistente en seguridad privada (AR) y nuestra calculadora de sueldo.
Respondé corto, humano (tono WhatsApp). No cites leyes salvo que lo pidan.`;

    // ⚠️ AI Gateway espera un ARRAY y el token va adentro de headers de cada provider
    const payload = [
      {
        provider: "workers-ai",
        endpoint: "@cf/meta/llama-3.1-8b-instruct",
        headers: {
          "Authorization": `Bearer ${GATEWAY_TOKEN}`,
          "Content-Type": "application/json"
        },
        query: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        }
      }
    ];

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // ← solo content-type global
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    // Extraer texto (cubre formatos del gateway y de workers ai)
    let reply = null;
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      reply =
        first?.response?.result?.response ||
        first?.response?.result?.output_text ||
        first?.result?.response ||
        first?.result?.output_text ||
        null;
    }
    if (!reply) {
      reply = data?.result?.response || data?.result?.output_text || null;
    }

    if (!resp.ok || !reply || !String(reply).trim()) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: `API:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
        })
      };
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
