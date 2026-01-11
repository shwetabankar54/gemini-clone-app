import React, { useState, useContext, useEffect, useCallback } from "react";
import './Sidebar.css';
import { sidebarIcons } from "../assets/Sidebar-Icons";
import { Context } from '../context/Context';

const DELETE_ANIMATION_DURATION = 300;

export default function Sidebar() {
    const [deletingChatId, setDeletingChatId] = useState(null);
    const { onSent, prevPrompts, setPrevPrompts, setRecentPrompt, newChat, newChatAnimated, loadCachedChat, showResult, currentChatId, sidebarExtended: extended, setSidebarExtended: setExtended } = useContext(Context);

    const handleNewChat = useCallback(() => {
        if (showResult) {
            newChatAnimated();
        } else {
            newChat();
        }
    }, [showResult, newChatAnimated, newChat]);

    const loadPrompt = async (chatEntry) => {
        if (typeof chatEntry === 'string') {
            setRecentPrompt(chatEntry);
            await onSent(chatEntry, false);
        } else if (chatEntry.response) {
            loadCachedChat(chatEntry);
        } else {
            setRecentPrompt(chatEntry.prompt);
            await onSent(chatEntry.prompt, false);
        }
    }

    const deleteChat = (e, chatId) => {
        e.stopPropagation();

        const isCurrentChat = showResult && chatId === currentChatId;

        if (isCurrentChat) {
            newChatAnimated();
        }

        setDeletingChatId(chatId);

        setTimeout(() => {
            setPrevPrompts(prev => prev.filter(chat => {
                const id = typeof chat === 'string' ? null : chat.id;
                return id !== chatId;
            }));

            setDeletingChatId(null);
        }, DELETE_ANIMATION_DURATION);
    }

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.ctrlKey && event.shiftKey && (event.key === 'O' || event.key === 'o' || event.code === 'KeyO')) {
                event.preventDefault();
                handleNewChat();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleNewChat]);

    return (
        <div className={`sidebar ${extended ? "extended" : ""}`}>
            <div className="top">
                <div onClick={() => setExtended(prev => !prev)} className="menu">
                    <img src={sidebarIcons.menu_icon} alt="" />
                    {!extended && <span className="tooltip">Expand menu</span>}
                    {extended && <span className="tooltip">Collapse menu</span>}
                </div>
                <div onClick={handleNewChat} className="new-chat">
                    <img src={sidebarIcons.plus_icon} alt="" />
                    {extended ? <p>New chat</p> : <span className="tooltip">New chat (Ctrl+Shift+O)</span>}
                </div>
                {extended
                    ? <div className="recent">
                        <p className="recent-title">Your chats</p>
                        {prevPrompts.map((item, index) => {
                            // Handle both old string format and new object format
                            const displayText = typeof item === 'string'
                                ? item.slice(0, 18) + '...'
                                : item.title;
                            const key = typeof item === 'string' ? index : item.id;
                            const chatId = typeof item === 'string' ? null : item.id;

                            return (
                                <div
                                    key={key}
                                    onClick={() => loadPrompt(item)}
                                    className={`recent-entry ${deletingChatId === chatId ? 'deleting' : ''}`}
                                >
                                    <p className="recent-entry-text">{displayText}</p>
                                    {chatId && (
                                        <div className="delete-icon-wrapper">
                                            <img
                                                src={sidebarIcons.delete_icon}
                                                alt="Delete"
                                                className="delete-icon"
                                                onClick={(e) => deleteChat(e, chatId)}
                                            />
                                            <span className="tooltip">Delete chat</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    : null
                }
            </div>
        </div>
    )
}
