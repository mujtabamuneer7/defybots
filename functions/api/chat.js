let chatHistory = []; // Memory for the bot

async function sendToGemini() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    // Show user message
    appendMsg(message, 'user-msg');
    input.value = '';

    // Add to memory
    chatHistory.push({ role: "user", parts: [{ text: message }] });

    try {
        // This calls the Cloudflare Pages Function
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        
        // Add AI response to UI
        appendMsg(data.reply, 'ai-msg');
        
        // Add to memory
        chatHistory.push({ role: "model", parts: [{ text: data.reply }] });

    } catch (err) {
        appendMsg("System Error: Could not reach the API. Ensure your '/functions' folder exists on GitHub.", 'ai-msg');
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
