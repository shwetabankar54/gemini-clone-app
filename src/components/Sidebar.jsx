import React, { useState, useContext } from "react";
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

    return (
        <div className={`sidebar ${extended ? "extended" : ""}`}>
            <div className="top">
                <div onClick={() => setExtended(prev => !prev)} className="menu">
                    <img src={sidebarIcons.menu_icon} alt="" />
                </div>
                <div onClick={() => newChat()} className="new-chat">
                    <img src={sidebarIcons.plus_icon} alt="" />
                    {extended ? <p>New chat</p> : null}
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
