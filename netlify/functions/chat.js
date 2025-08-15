export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: "Sos Sebastián, un asistente experto en seguridad privada en Argentina. Siempre pregunta primero como es el nombre del usuario y siempre nombralo. Respondé breve y claro, como en un chat de WhatsApp. Evitá dar leyes salvo que el usuario las pida expresamente."
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // Si hay contenido, lo usa. Si no, muestra todo el JSON crudo
    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.response ||
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
