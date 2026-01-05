// --- 1. CONFIGURATION ---
const API_KEY = "AIzaSyBOp41_7YKoJ7PR6VdTTTmvw3csoSESK6c";
let chatHistory = []; // Stores conversation memory

// --- 2. LOGIN LOGIC ---
function checkAuth() {
    const pass = document.getElementById('passInput').value;
    // Password is set to 'mujtaba' based on your previous messages
    if (pass.toLowerCase() === 'mujtaba') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
    } else {
        alert("Incorrect Password");
    }
}

// --- 3. CHAT LOGIC (DIRECT TO GOOGLE) ---
async function sendToGemini() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Show User Message
    appendMsg(message, 'user-msg');
    input.value = '';

    // Save to Memory
    chatHistory.push({
        role: "user",
        parts: [{ text: message }]
    });

    try {
        // We call Google's API directly from the browser
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: chatHistory
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || "API Request Failed");
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Show AI Response
        appendMsg(aiResponse, 'ai-msg');

        // Save AI Response to Memory
        chatHistory.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });

    } catch (err) {
        console.error("Gemini Error:", err);
        appendMsg("System Error: " + err.message, 'ai-msg');
    }
}

// --- 4. HELPERS ---
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
    if (e.key === 'Enter') {
        sendToGemini();
    }
}
