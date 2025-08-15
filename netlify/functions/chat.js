export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    // Variables de entorno de Netlify
    const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
    const GATEWAY_ID = process.env.CF_GATEWAY_ID;
    const WORKERS_AI_TOKEN = process.env.CF_WORKERS_AI_TOKEN;

    // Endpoint de Cloudflare Workers AI
    const endpoint = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_ID}/workers-ai/@cf/meta/llama-3.1-8b-instruct`;

    // Request a Cloudflare
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WORKERS_AI_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Sos Sebastián, un asistente experto en seguridad privada en Argentina. Siempre pregunta primero el nombre del usuario y siempre nombralo. Respondé breve y claro, como en un chat de WhatsApp."
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    let reply =
      data?.result?.response ||
      data?.choices?.[0]?.message?.content ||
      JSON.stringify(data, null, 2);

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
