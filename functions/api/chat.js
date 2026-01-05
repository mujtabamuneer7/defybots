export async function onRequestPost({ request, env }) {
  try {
    const { prompt, history = [] } = await request.json();

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("API key missing", { status: 500 });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      apiKey;

    const contents = [
      ...history,
      { role: "user", parts: [{ text: prompt }] }
    ];

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Gemini API failed");
    }

    const text = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ text }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
