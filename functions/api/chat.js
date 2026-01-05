const API_KEY = "AIzaSyBOp41_7YKoJ7PR6VdTTTmvw3csoSESK6c";
let history = [];

// This tells the bot how to behave
const SYSTEM_PROMPT = "You are DefyBot AI, a helpful assistant created for Mujtaba. Be concise and professional.";

function checkAuth() {
    const pass = document.getElementById('passInput').value;
    if (pass.toLowerCase() === 'mujtaba') {
        document.getElementById('loginPage').classList.add('hidden');
    } else {
        alert("Incorrect Password");
    }
}

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
}

async function sendToGemini() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    appendMsg(message, 'user-msg');
    input.value = '';

    // Add to history
    if (history.length === 0) {
        history.push({ role: "user", parts: [{ text: SYSTEM_PROMPT + " User says: " + message }] });
    } else {
        history.push({ role: "user", parts: [{ text: message }] });
    }

    // Create a temporary "Thinking..." bubble
    const tempId = "thinking-" + Date.now();
    const container = document.getElementById('chatDisplay');
    const tempDiv = document.createElement('div');
    tempDiv.id = tempId;
    tempDiv.className = "msg ai-msg";
    tempDiv.innerText = "DefyBot is thinking...";
    container.appendChild(tempDiv);
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: history,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        const data = await response.json();
        
        // Remove the "Thinking..." bubble
        document.getElementById(tempId).remove();

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            appendMsg(aiText, 'ai-msg');
            history.push({ role: "model", parts: [{ text: aiText }] });
        } else {
            // This will tell us if the API Key is the problem
            const errorMsg = data.error ? data.error.message : "Unknown API Error";
            appendMsg("Google API Error: " + errorMsg, 'ai-msg');
        }

    } catch (err) {
        document.getElementById(tempId).remove();
        appendMsg("Connection Error: Please ensure you are viewing this via your HTTPS live link, not a local file.", 'ai-msg');
        console.error(err);
    }
}

function appendMsg(text, type) {
    const container = document.getElementById('chatDisplay');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
