export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const url = `https://gateway.ai.cloudflare.com/v1/${process.env.CF_ACCOUNT_ID}/${process.env.CF_GATEWAY_ID}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CF_WORKERS_AI_TOKEN}`
      },
      body: JSON.stringify([
        {
          provider: "workers-ai",
          endpoint: "@cf/meta/llama-3.1-8b-instruct",
          query: {
            messages: [
              {
                role: "system",
                content: "Sos Sebastián, un asistente experto en seguridad privada en Argentina. Siempre pregunta primero el nombre del usuario y siempre nombralo. Respondé breve y claro, como en WhatsApp."
              },
              { role: "user", content: message }
            ]
          }
        }
      ])
    });

    const data = await response.json();

    let reply =
      data?.[0]?.result?.response ||
      data?.[0]?.result?.output_text ||
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
