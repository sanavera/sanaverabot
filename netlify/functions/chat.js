// netlify/functions/chat.js
export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch("https://gateway.ai.cloudflare.com/v1/5b577fa788a8fb7277063ac8afc06c28/chat-vigi", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        provider: "workers-ai",
        endpoint: "@cf/meta/llama-3.1-8b-instruct",
        query: {
          messages: [
            {
              role: "system",
              content: "Sos Sebastián, un asistente experto en seguridad privada en Argentina. Siempre pregunta primero el nombre del usuario y siempre nombralo. Respondé breve y claro, como en un chat de WhatsApp. Evitá dar leyes salvo que el usuario las pida expresamente."
            },
            {
              role: "user",
              content: message
            }
          ]
        }
      })
    });

    const data = await response.json();

    // Si hay texto del bot, úsalo; si no, mostrar todo el JSON
    let reply =
      data?.result?.response ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
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
