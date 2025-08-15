export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/TU_ACCOUNT_ID/ai/run/@cf/meta/llama-3.1-8b-instruct",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CF_WORKERS_AI_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Sos Sebastián, un asistente experto en seguridad privada en Argentina..."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();
    let reply =
      data?.result?.response ||
      data?.result?.output_text ||
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
