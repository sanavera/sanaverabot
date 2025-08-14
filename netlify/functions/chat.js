// netlify/functions/chat.js
export async function handler(event) {
  try {
    const { message, history = [] } = JSON.parse(event.body);

    // Construir historial, siempre empezando con el system prompt
    const systemPrompt = `Sos Sebastián, un asistente experto en seguridad privada en Argentina
y en el proyecto "Calculadora de sueldo de vigilador".
Respondé breve y claro, como un chat de WhatsApp.
No cites leyes salvo que te lo pidan.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.filter(m => m && m.role && m.content), // filtramos basura
      { role: "user", content: message }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    // Capturamos cualquier campo que pueda traer contenido
    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.response ||
      data?.choices?.[0]?.message?.reasoning ||
      "";

    // Si no hay nada, limpiamos historial y probamos otra vez
    if (!reply.trim()) {
      console.warn("Respuesta vacía, reintentando con historial limpio...");
      const retryRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        })
      });
      const retryData = await retryRes.json();
      reply =
        retryData?.choices?.[0]?.message?.content ||
        retryData?.choices?.[0]?.text ||
        retryData?.response ||
        retryData?.choices?.[0]?.message?.reasoning ||
        "No pude responder (sin contenido)";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("Error en chat.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
