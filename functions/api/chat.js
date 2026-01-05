// --- YOUR SETTINGS ---
const API_KEY = "AIzaSyBOp41_7YKoJ7PR6VdTTTmvw3csoSESK6c";
let chatHistory = []; // This stores the memory of the chat

// --- AUTHENTICATION ---
function checkAuth() {
    const pass = document.getElementById('passInput').value;
    if (pass.toLowerCase() === 'mujtaba') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
    } else {
        alert("Incorrect Password");
    }
}

// --- CHAT LOGIC ---
async function sendToGemini() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    // 1. Show user message in UI
    appendMsg(message, 'user-msg');
    input.value = '';

    // 2. Add message to memory
    chatHistory.push({
        role: "user",
        parts: [{ text: message }]
    });

    try {
        // 3. Talk DIRECTLY to Google Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: chatHistory
            })
        });

        const data = await response.json();

        // 4. Check for API Errors
        if (data.error) {
            appendMsg("Google API Error: " + data.error.message, 'ai-msg');
            return;
        }

        // 5. Get AI text and show it
        const aiResponse = data.candidates[0].content.parts[0].text;
        appendMsg(aiResponse, 'ai-msg');

        // 6. Save AI response to memory
        chatHistory.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });

    } catch (err) {
        console.error(err);
        appendMsg("System Error: Check your internet connection or API key.", 'ai-msg');
    }
}

function appendMsg(text, type) {
    const container = document.getElementById('chatDisplay');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    container.appendChild(div);
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function handleEnter(e) {
    if (e.key === 'Enter') sendToGemini();
}
