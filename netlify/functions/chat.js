export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "system", content: "Solo responde sobre temas de seguridad" },
                   { role: "user", content: message }]
      })
    });

    const data = await apiRes.json();
    const reply = data.choices?.[0]?.message?.content || "No pude responder";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
