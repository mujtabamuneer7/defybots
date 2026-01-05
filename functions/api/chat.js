const API_KEY = "AIzaSyBOp41_7YKoJ7PR6VdTTTmvw3csoSESK6c";
let history = [];

async function sendToGemini() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    appendMsg(message, 'user-msg');
    input.value = '';

    // Add user message to history
    history.push({ role: "user", parts: [{ text: message }] });

    // Loading Indicator
    const tempId = "loader-" + Date.now();
    const container = document.getElementById('chatDisplay');
    const loaderDiv = document.createElement('div');
    loaderDiv.id = tempId;
    loaderDiv.className = "msg ai-msg";
    loaderDiv.innerText = "DefyBot is thinking...";
    container.appendChild(loaderDiv);
    container.scrollTop = container.scrollHeight;

    try {
        // v1 is often more stable for 404 issues than v1beta
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: history,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();
        
        // Remove Loader
        const loader = document.getElementById(tempId);
        if(loader) loader.remove();

        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            appendMsg(aiText, 'ai-msg');
            history.push({ role: "model", parts: [{ text: aiText }] });
        } else {
            // Detailed Debugging for 404
            const errorInfo = data.error ? `${data.error.status}: ${data.error.message}` : "Unknown Error";
            appendMsg("Error from Google: " + errorInfo, 'ai-msg');
            console.error("Full Data Object:", data);
        }

    } catch (err) {
        if(document.getElementById(tempId)) document.getElementById(tempId).remove();
        appendMsg("System Error: Check console for details.", 'ai-msg');
        console.error("Fetch Error:", err);
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

function checkAuth() {
    const pass = document.getElementById('passInput').value;
    if (pass.toLowerCase() === 'mujtaba') {
        document.getElementById('loginPage').style.display = 'none';
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
