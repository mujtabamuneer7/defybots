export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. Get the conversation from the frontend
    const { contents } = await request.json();

    // 2. Use the API Key from your Cloudflare Pages Dashboard (Environment Variables)
    const API_KEY = env.GEMINI_API_KEY;AIzaSyBOp41_7YKoJ7PR6VdTTTmvw3csoSESK6c
    const model = "gemini-1.5-flash"; // You can also use gemini-1.5-pro
    
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ reply: aiText }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
