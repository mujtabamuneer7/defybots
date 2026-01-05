const API_KEY = "AIzaSyBOp41_7YKoJ7PR6VdTTTmvw3csoSESK6c";
let history = []; 

// This tells Gemini how to act
const SYSTEM_INSTRUCTION = "You are DefyBot AI, a professional assistant for Mujtaba. Always respond in a helpful, concise manner.";

function unlock() {
    if (document.getElementById('passCode').value.toLowerCase() === 'mujtaba') {
        document.getElementById('loginOverlay').style.display = 'none';
    } else { alert("Access Denied"); }
}

function switchPage(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden').classList.add('flex');
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
        b.classList.add('text-slate-600');
    });
    btn.classList.add('bg-indigo-50', 'text-indigo-700', 'font-semibold');
}

async function callGemini(userInput, isChat = true) {
    // We use the v1beta endpoint - it's the most compatible with 1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // Prepare the contents
    let contents = [];
    
    if (isChat) {
        // Add existing history
        contents = [...history];
        // Add new user message
        contents.push({ role: "user", parts: [{ text: userInput }] });
    } else {
        contents = [{ role: "user", parts: [{ text: userInput }] }];
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google Error:", data.error);
            return `⚠️ Google API Error: ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            if (isChat) {
                // Save both to history to keep the conversation going
                history.push({ role: "user", parts: [{ text: userInput }] });
                history.push({ role: "model", parts: [{ text: aiResponse }] });
            }
            return aiResponse;
        }
        
        return "🤖 Gemini received the message but didn't return text. Check your Safety Settings in AI Studio.";

    } catch (err) {
        console.error("Fetch Error:", err);
        return "❌ Connection failed. Are you testing on a live HTTPS site?";
    }
}

async function sendChat() {
    const input = document.getElementById('userInput');
    const msg = input.value.trim();
    if (!msg) return;

    appendMsg(msg, 'user');
    input.value = '';

    const loadingId = "L-" + Date.now();
    appendMsg("DefyBot is thinking...", 'ai', loadingId);

    const result = await callGemini(msg, true);
    
    const loader = document.getElementById(loadingId);
    if (loader) loader.innerText = result;
}

async function generateProposal() {
    const client = document.getElementById('clientName').value;
    const goals = document.getElementById('projectGoals').value;
    const resBox = document.getElementById('toolResult');

    if (!client || !goals) return alert("Please fill all fields");

    resBox.classList.remove('hidden');
    resBox.innerText = "Generating professional proposal...";

    const prompt = `Write a detailed business proposal for ${client}. Project goals: ${goals}. Formatting: Use professional headers and a clear structure.`;
    const result = await callGemini(prompt, false);
    resBox.innerText = result;
}

function appendMsg(text, sender, id = null) {
    const win = document.getElementById('chat-window');
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-
