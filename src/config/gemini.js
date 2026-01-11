import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
    console.error("VITE_GOOGLE_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

const generationConfig = {
    temperature: 0.9,
    topP: 1,
    maxOutputTokens: 2048,
};

async function runChat(prompt) {
    if (!apiKey) {
        throw new Error("API key not configured. Please set VITE_GOOGLE_API_KEY in your .env file.");
    }

    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new Error("Empty response from API");
        }

        return text;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

async function generateTitle(prompt) {
    try {
        const titlePrompt = `Generate a very short title (maximum 4-5 words) for this conversation based on the user's question. Only return the title, nothing else. Question: "${prompt}"`;

        const result = await model.generateContent(titlePrompt);
        const response = result.response;
        let title = response.text().trim();

        title = title.replace(/^["']|["']$/g, '');

        if (title.length > 40) {
            title = title.substring(0, 37) + '...';
        }

        return title;
    } catch (error) {
        console.error("Title generation error:", error);
        return prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '');
    }
}

export default runChat;
export { generateTitle };
