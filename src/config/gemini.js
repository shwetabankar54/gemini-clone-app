import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-pro",
});

const generationConfig = {
    temperature: 0.9,
    topP: 1,
    maxOutputTokens: 2048,
};

async function runChat(prompt) {
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = result.response;
    return response.text();
}

export default runChat;

