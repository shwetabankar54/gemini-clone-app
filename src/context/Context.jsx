import { createContext, useState, useEffect } from "react";
import { marked } from "marked";
import runChat, { generateTitle } from "../config/gemini";

export const Context = createContext();

const ANIMATION_TOTAL_DURATION = 900;

// Configure marked
marked.setOptions({
    breaks: true,
    gfm: true
});

const formatResponse = (response) => {
    return marked.parse(response);
};

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [messages, setMessages] = useState([]);
    const [sidebarExtended, setSidebarExtended] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);

    useEffect(() => {
        try {
            const savedChats = localStorage.getItem('gemini-chat-history');
            if (savedChats) {
                const parsedChats = JSON.parse(savedChats);
                setPrevPrompts(parsedChats);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }, []);

    useEffect(() => {
        if (prevPrompts.length > 0) {
            try {
                localStorage.setItem('gemini-chat-history', JSON.stringify(prevPrompts));
            } catch (error) {
                console.error('Failed to save chat history:', error);
            }
        }
    }, [prevPrompts]);

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setInput("");
        setRecentPrompt("");
        setMessages([]);
        setCurrentChatId(null);
    };

    const newChatAnimated = () => {
        setIsResetting(true);
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setInput("");
        setRecentPrompt("");
        setMessages([]);
        setCurrentChatId(null);

        setTimeout(() => {
            setIsResetting(false);
        }, ANIMATION_TOTAL_DURATION);
    };

    const loadCachedChat = (chatEntry) => {
        setRecentPrompt(chatEntry.prompt);
        setShowResult(true);
        setResultData(chatEntry.response);
        setCurrentChatId(chatEntry.id);
        setMessages([
            {
                role: 'user',
                content: chatEntry.prompt,
                timestamp: chatEntry.id
            },
            {
                role: 'assistant',
                content: chatEntry.response,
                timestamp: chatEntry.id + 1
            }
        ]);
    };

    const editAndResend = async (editedPrompt) => {
        setLoading(true);
        setRecentPrompt(editedPrompt);

        setMessages(prev => {
            const newMessages = [...prev];
            for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].role === 'user') {
                    newMessages[i] = { ...newMessages[i], content: editedPrompt };
                    break;
                }
            }
            for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].role === 'assistant') {
                    newMessages.splice(i, 1);
                    break;
                }
            }
            return newMessages;
        });

        try {
            const response = await runChat(editedPrompt);
            const formattedResponse = formatResponse(response);

            const assistantMessage = {
                role: 'assistant',
                content: formattedResponse,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setResultData(formattedResponse);
        } catch (error) {
            console.error("Error getting response:", error);
            let errorMessage = "Sorry, I encountered an error. ";

            if (error.message.includes("API key") || !import.meta.env.VITE_GOOGLE_API_KEY) {
                errorMessage = "API Key Error: Please check that your VITE_GOOGLE_API_KEY is set correctly in the .env file. Get your API key from https://aistudio.google.com/apikey";
            } else if (error.message.includes("network") || error.message.includes("fetch")) {
                errorMessage += "Please check your internet connection and try again.";
            } else {
                errorMessage += "Please try again later. Error: " + error.message;
            }

            // Add error as assistant message so it shows in chat
            const errorAssistantMessage = {
                role: 'assistant',
                content: errorMessage,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorAssistantMessage]);
            setResultData(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onSent = async (prompt, addToHistory = true) => {
        const isNewConversation = !showResult;
        setLoading(true);
        setShowResult(true);

        let response;
        let currentPrompt;

        if (prompt !== undefined) {
            currentPrompt = prompt;
            setRecentPrompt(prompt);
        } else {
            currentPrompt = input;
            setRecentPrompt(input);
        }

        const userMessage = {
            role: 'user',
            content: currentPrompt,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            response = await runChat(currentPrompt);
            const formattedResponse = formatResponse(response);

            const assistantMessage = {
                role: 'assistant',
                content: formattedResponse,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setResultData(formattedResponse);

            if (addToHistory && isNewConversation) {
                const chatId = Date.now();
                setCurrentChatId(chatId);
                generateTitle(currentPrompt).then(title => {
                    const chatEntry = {
                        id: chatId,
                        title: title,
                        prompt: currentPrompt,
                        response: formattedResponse
                    };
                    setPrevPrompts(prev => [...prev, chatEntry]);
                }).catch(err => {
                    console.error("Failed to generate title:", err);
                    const chatEntry = {
                        id: chatId,
                        title: currentPrompt.substring(0, 30) + (currentPrompt.length > 30 ? '...' : ''),
                        prompt: currentPrompt,
                        response: formattedResponse
                    };
                    setPrevPrompts(prev => [...prev, chatEntry]);
                });
            }
        } catch (error) {
            console.error("Error getting response:", error);

            let errorMessage = "Sorry, I encountered an error. ";

            if (error.message.includes("API key") || !import.meta.env.VITE_GOOGLE_API_KEY) {
                errorMessage = "API Key Error: Please check that your VITE_GOOGLE_API_KEY is set correctly in the .env file. Get your API key from https://aistudio.google.com/apikey";
            } else if (error.message.includes("network") || error.message.includes("fetch")) {
                errorMessage += "Please check your internet connection and try again.";
            } else {
                errorMessage += "Please try again later. Error: " + error.message;
            }

            const errorAssistantMessage = {
                role: 'assistant',
                content: errorMessage,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorAssistantMessage]);
            setResultData(errorMessage);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        newChatAnimated,
        isResetting,
        loadCachedChat,
        messages,
        sidebarExtended,
        setSidebarExtended,
        editAndResend,
        currentChatId
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
