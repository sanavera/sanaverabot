document.getElementById('sendBtn').addEventListener('click', async () => {
  const input = document.getElementById('userInput').value;
  const resElem = document.getElementById('response');
  resElem.textContent = "Pensando...";

  try {
    const res = await fetch('/.netlify/functions/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    resElem.textContent = data.reply || "Sin respuesta";
  } catch (err) {
    resElem.textContent = "Error: " + err.message;
  }
});
