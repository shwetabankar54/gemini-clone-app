import React, { useContext } from 'react';
import './Main.css';
import { assets } from "../assets/assets";
import { sidebarIcons } from "../assets/Sidebar-Icons";
import { Context } from '../context/Context';

export default function Main() {
    const {onSent, recentPrompt, showResult, loading, resultData, setInput, input} = useContext(Context);

    return (
        <div className="main">
            <div className="nav">
                <p>Gemini</p>
            </div>
            <div className="main-container">
                {!showResult
                ? <>
                    <div className="greet">
                        <p><span>Hello!</span></p>
                        <p>How can I help you today?</p>
                    </div>
                    <div className="main-bottom">
                        <div className="search-box">
                            <input
                                onChange={(e) => setInput(e.target.value)}
                                value={input}
                                type="text"
                                placeholder="Enter a prompt here"
                            />
                            <div>
                                <img src={assets.gallery_icon} alt="" />
                                <img src={assets.mic_icon} alt="" />
                                {input ? <img onClick={() => onSent()} src={assets.send_icon} alt="" /> : null}
                            </div>
                        </div>
                    </div>
                </>
                : <div className="result">
                    <div className="result-title">
                        <img src={assets.user_icon} alt="" />
                        <p>{recentPrompt}</p>
                    </div>
                    <div className="result-data">
                        <img src={assets.gemini_icon} alt="" />
                        {loading
                        ? <div className="loader">
                            <hr />
                            <hr />
                            <hr />
                        </div>
                        : <p dangerouslySetInnerHTML={{__html:resultData}}></p>
                        }
                    </div>
                </div>
                }
            </div>
        </div>
    )
}
