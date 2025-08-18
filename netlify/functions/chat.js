export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    // Endpoint con tu Account ID real
    const url = "https://api.sebastiansanavera.com/v4/5b577fa788a8fb7277063ac8afc06c28/ai/run/@cf/sanavera/sanavera-neurona1-0";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CF_WORKERS_AI_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Soy Sebastián😊"
          },
          {
            role: "user",
            content: message
          }
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
