import React, { useContext, useState, useEffect, useRef } from 'react';
import './Main.css';
import { assets } from "../assets/assets";
import { sidebarIcons } from "../assets/Sidebar-Icons";
import { Context } from '../context/Context';

export default function Main() {
    const {onSent, recentPrompt, showResult, loading, resultData, setInput, input, newChat, setRecentPrompt} = useContext(Context);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const fileMenuRef = useRef(null);
    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);
    const copyTimeoutRef = useRef(null);
    const editTextareaRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [copyNoticeVisible, setCopyNoticeVisible] = useState(false);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [draftPrompt, setDraftPrompt] = useState("");
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    const [isEditOverflow, setIsEditOverflow] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) {
                setShowFileMenu(false);
            }
        };

        if (showFileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFileMenu]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isEditingPrompt || !editTextareaRef.current) return;
        const textarea = editTextareaRef.current;
        const styles = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(styles.lineHeight) || 0;
        const paddingTop = parseFloat(styles.paddingTop) || 0;
        const paddingBottom = parseFloat(styles.paddingBottom) || 0;
        const maxHeight = lineHeight * 7 + paddingTop + paddingBottom;

        textarea.style.height = 'auto';
        const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${nextHeight}px`;
        setIsEditOverflow(textarea.scrollHeight > maxHeight);
    }, [isEditingPrompt, draftPrompt]);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleCopyPrompt = async () => {
        if (!recentPrompt) return;
        try {
            await navigator.clipboard.writeText(recentPrompt);
            setCopyNoticeVisible(true);
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            copyTimeoutRef.current = setTimeout(() => {
                setCopyNoticeVisible(false);
            }, 4500);
        } catch (error) {
            console.error('Failed to copy prompt:', error);
        }
    };

    const handleEditPrompt = () => {
        if (!recentPrompt) return;
        setDraftPrompt(recentPrompt);
        setIsEditingPrompt(true);
    };

    const handleCancelEdit = () => {
        setDraftPrompt(recentPrompt);
        setIsEditingPrompt(false);
    };

    const handleUpdatePrompt = () => {
        setRecentPrompt(draftPrompt);
        setIsEditingPrompt(false);
        setIsPromptExpanded(false);
        requestAnimationFrame(() => {
            textInputRef.current?.focus();
        });
    };

    const getPromptSentences = (text) => {
        return text.split(/(?<=[.!?])\s+/).filter(Boolean);
    };

    const sentences = getPromptSentences(recentPrompt || "");
    const hasMoreSentences = sentences.length > 5;
    const promptText = isPromptExpanded || !hasMoreSentences
        ? recentPrompt
        : sentences.slice(0, 5).join(" ");
    const isPromptDirty = draftPrompt !== recentPrompt;

    return (
        <div className="main">
            {copyNoticeVisible && (
                <div className="copy-toast" role="status" aria-live="polite">
                    <span>Prompt copied</span>
                    <button className="copy-toast-action" type="button" onClick={newChat}>Start new chat</button>
                </div>
            )}
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
                </>
                : <div className="result">
                    <div className="result-user">
                        {!isEditingPrompt && (
                            <div className="prompt-actions">
                                <button className="copy-prompt" type="button" onClick={handleCopyPrompt}>
                                    <img src={assets.copy_icon} alt="" className="edit-icon" />
                                    <span className="icon-tooltip">Copy prompt</span>
                                </button>
                                <button className="edit-prompt" type="button" onClick={handleEditPrompt}>
                                    <img src={assets.pencil_icon} alt="" className="edit-icon" />
                                    <span className="icon-tooltip">Edit prompt</span>
                                </button>
                            </div>
                        )}
                        {!isEditingPrompt ? (
                            <div className="user-bubble">
                                {hasMoreSentences && (
                                    <button
                                        className="prompt-toggle"
                                        type="button"
                                        onClick={() => setIsPromptExpanded(prev => !prev)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                            className={`prompt-toggle-icon ${isPromptExpanded ? 'is-open' : ''}`}
                                        >
                                            <path d="M1.646 5.646a.5.5 0 0 1 .708 0L8 11.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                        </svg>
                                        <span className="icon-tooltip">
                                            {isPromptExpanded ? "Collapse text" : "Expand text"}
                                        </span>
                                    </button>
                                )}
                                <p>{promptText}</p>
                            </div>
                        ) : (
                            <div className="edit-bubble">
                                <textarea
                                    className="edit-textarea"
                                    ref={editTextareaRef}
                                    value={draftPrompt}
                                    onChange={(e) => setDraftPrompt(e.target.value)}
                                    rows={1}
                                    style={{ overflowY: isEditOverflow ? 'auto' : 'hidden' }}
                                />
                                <div className="edit-actions">
                                    <button className="edit-cancel" type="button" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                    <button
                                        className="edit-update"
                                        type="button"
                                        onClick={handleUpdatePrompt}
                                        disabled={!isPromptDirty}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="result-data">
                        <img src={assets.gemini_icon} alt="" className="assistant-icon" />
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

                <div className={`main-bottom ${showResult ? 'fixed-bottom' : ''}`}>
                    <div className="search-box">
                        <div
                            className={`plus-icon-wrapper ${showFileMenu ? 'is-active' : ''}`}
                            ref={fileMenuRef}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="plus-icon"
                                viewBox="0 0 16 16"
                                onClick={() => setShowFileMenu(!showFileMenu)}
                            >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                            </svg>
                            {!showFileMenu && <span className="icon-tooltip">Add files</span>}
                            {showFileMenu && (
                                <div className="file-menu">
                                    <div className="file-menu-item" onClick={handleUploadClick}>
                                        <img src={assets.upload_icon} alt="" style={{width: '18px', height: '18px'}} />
                                        <span>Upload files</span>
                                    </div>
                                    <div className="file-menu-item">
                                        <img src={assets.drive_icon} alt="" style={{width: '18px', height: '18px'}} />
                                        <span>Add from Drive</span>
                                    </div>
                                    <div className="file-menu-item">
                                        <img src={assets.photos_icon} alt="" style={{width: '18px', height: '18px'}} />
                                        <span>Photos</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <input
                            ref={textInputRef}
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            type="text"
                            placeholder="Ask Gemini"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && input.trim()) {
                                    e.preventDefault();
                                    onSent();
                                }
                            }}
                        />
                        <div className="search-icons">
                            {input ? (
                                <div className="send-icon-wrapper" onClick={() => onSent()}>
                                    <img
                                        src={assets.send_icon}
                                        alt=""
                                        className="send-icon icon-slide-in"
                                    />
                                    <span className="icon-tooltip">Submit</span>
                                </div>
                            ) : (
                                <div className="mic-icon-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="mic-icon icon-slide-in" viewBox="0 0 16 16">
                                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                    <span className="icon-tooltip">Use microphone</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
