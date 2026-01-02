import React, {useState, useContext} from "react";
import './Sidebar.css';
import { sidebarIcons } from "../assets/Sidebar-Icons";
import { Context } from '../context/Context';

export default function Sidebar() {

    const [extended,setExtended] = useState(false);
    const {onSent, prevPrompts, setRecentPrompt, newChat} = useContext(Context);

    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt);
        await onSent(prompt);
    }

    return (
        <div className={`sidebar ${extended ? "extended" : ""}`}>
            <div className="top">
                <img onClick={()=>setExtended(prev=>!prev)} className="menu" src={sidebarIcons.menu_icon} alt="" />
                <div onClick={() => newChat()} className="new-chat">
                    <img src={sidebarIcons.plus_icon} alt="" />
                    {extended?<p>New Chat</p>:null}
                </div>
                {extended
                    ? <div className="recent">
                        <p className="recent-title">Recent</p>
                        {prevPrompts.map((item, index) => {
                            return (
                                <div key={index} onClick={() => loadPrompt(item)} className="recent-entry">
                                    <img src={sidebarIcons.message_icon} alt="" />
                                    <p>{item.slice(0, 18)} ...</p>
                                </div>
                            )
                        })}
                    </div>
                    : null
                }
            </div>
            <div className="bottom">
                <div className="bottom-item">
                    <img src={sidebarIcons.question_icon} alt="" />
                    {extended?<p>Help</p>:null}
                </div>

                <div className="bottom-item">
                    <img src={sidebarIcons.history_icon} alt="" />
                    {extended?<p>Activity</p>:null}
                </div>

                <div className="bottom-item">
                    <img src={sidebarIcons.setting_icon} alt="" />
                    {extended?<p>Settings</p>:null}
                </div>
            </div>
        </div>
    )
}
