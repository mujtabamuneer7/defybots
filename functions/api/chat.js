// --- THE FINAL FIXED API CALL ---
async function callGemini(prompt, isChat = true) {
    // UPDATED: Using /v1/ instead of /v1beta/ for better stability
    // UPDATED: Using 'gemini-1.5-flash' which is the standard production name
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const messageObj = { role: "user", parts: [{ text: prompt }] };
    
    // Manage history
    if (isChat) {
        history.push(messageObj);
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: isChat ? history : [messageObj] 
            })
        });

        const data = await response.json();

        // Check if Google returned an error
        if (data.error) {
            // If 1.5-flash is not found, try the original gemini-pro as a fallback
            if (data.error.message.includes("not found")) {
                return await fallbackToGeminiPro(prompt, isChat);
            }
            throw new Error(data.error.message);
        }

        const aiText = data.candidates[0].content.parts[0].text;
        
        if (isChat) {
            history.push({ role: "model", parts: [{ text: aiText }] });
        }
        return aiText;

    } catch (err) {
        console.error("Gemini Error:", err);
        return `❌ API Error: ${err.message}`;
    }
}

// FALLBACK FUNCTION IN CASE FLASH IS NOT IN YOUR PROJECT
async function fallbackToGeminiPro(prompt, isChat) {
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
    try {
        const response = await fetch(fallbackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: isChat ? history : [{ role: "user", parts: [{ text: prompt }] }] 
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "❌ Both Gemini Flash and Pro models are unavailable in your project. Please check AI Studio.";
    }
}
