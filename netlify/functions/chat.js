// netlify/functions/chat.js
export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Falta 'message'." }) };
    }

    // ⚙️ Variables de entorno (Netlify → Site settings → Env vars)
    const CF_ACCOUNT_ID   = process.env.CF_ACCOUNT_ID;     // ej: 5b577fa7...
    const CF_GATEWAY_ID   = process.env.CF_GATEWAY_ID;     // ej: chat-vigi
    const CF_WORKERS_TOKEN= process.env.CF_WORKERS_AI_TOKEN; // API token con permiso Workers AI (Read/Edit/Invoke)
    const CF_AIG_TOKEN    = process.env.CF_AIG_TOKEN;      // (opcional) token del Gateway si activaste “Authenticated Gateway”

    if (!CF_ACCOUNT_ID || !CF_GATEWAY_ID || !CF_WORKERS_TOKEN) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply:
`Faltan env vars:
- CF_ACCOUNT_ID
- CF_GATEWAY_ID
- CF_WORKERS_AI_TOKEN
(opcional) CF_AIG_TOKEN`
        })
      };
    }

    const url = `https://gateway.ai.cloudflare.com/v1/${CF_ACCOUNT_ID}/${CF_GATEWAY_ID}/workers-ai/v1/chat/completions`;

    // Prompt del sistema
    const systemPrompt = `Sos Sebastián, asistente de seguridad privada (Argentina) y calculadora de sueldo.
Respondé corto, humano (tono WhatsApp). No cites leyes salvo que lo pidan explícitamente.`;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CF_WORKERS_TOKEN}` // ← token de Workers AI
    };
    // Si el Gateway está autenticado, manda este header extra:
    if (CF_AIG_TOKEN) headers["cf-aig-authorization"] = `Bearer ${CF_AIG_TOKEN}`; // ← token del Gateway

    const body = {
      model: "@cf/meta/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    };

    const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const data = await resp.json();

    // Workers AI (OpenAI-compat) devuelve choices[0].message.content
    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.result?.response || data?.result?.output_text || null;

    if (!resp.ok || !reply) {
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
