import React, { useState, useContext, useEffect } from "react";
import './Sidebar.css';
import { sidebarIcons } from "../assets/Sidebar-Icons";
import { Context } from '../context/Context';

export default function Sidebar() {
    const [extended, setExtended] = useState(false);
    const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);

    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt);
        await onSent(prompt);
    }

    // Keyboard shortcut for new chat (Ctrl+Shift+O)
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Check for Ctrl+Shift+O using both key and keyCode for compatibility
            if (event.ctrlKey && event.shiftKey && (event.key === 'O' || event.key === 'o' || event.code === 'KeyO')) {
                event.preventDefault();
                console.log('New chat shortcut triggered');
                newChat();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [newChat]);

    return (
        <div className={`sidebar ${extended ? "extended" : ""}`}>
            <div className="top">
                <div onClick={() => setExtended(prev => !prev)} className="menu">
                    <img src={sidebarIcons.menu_icon} alt="" />
                    {!extended && <span className="tooltip">Expand menu</span>}
                    {extended && <span className="tooltip">Collapse menu</span>}
                </div>
                <div onClick={() => newChat()} className="new-chat">
                    <img src={sidebarIcons.plus_icon} alt="" />
                    {extended ? <p>New chat</p> : <span className="tooltip">New chat (Ctrl+Shift+O)</span>}
                </div>
                {extended
                    ? <div className="recent">
                        {prevPrompts.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    onClick={() => loadPrompt(item)}
                                    className="recent-entry"
                                >
                                    <img src={sidebarIcons.message_icon} alt="" />
                                    <p>{item.slice(0, 18)} ...</p>
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
