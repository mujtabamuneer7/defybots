export async function onRequestPost({ request, env }) {
  try {
    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const prompt = body.prompt;
    const history = body.history || [];

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt missing" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      env.GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    });

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return new Response(
        JSON.stringify({ error: "Invalid Gemini response", raw: data }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const reply = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
