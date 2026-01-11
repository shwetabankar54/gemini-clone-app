import React, { useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import './Main.css';
import { assets } from "../assets/assets";
import { Context } from '../context/Context';

// Constants
const MIC_STOP_DELAY = 400;
const MIC_TRANSITION_DELAY = 700;
const TOAST_DURATION = 4500;
const MAX_EDIT_LINES = 7;

export default function Main() {
    const {onSent, recentPrompt, showResult, loading, resultData, setInput, input, newChatAnimated, isResetting, messages, sidebarExtended, editAndResend} = useContext(Context);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const fileMenuRef = useRef(null);
    const fileInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const copyTimeoutRef = useRef(null);
    const editTextareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [copyNoticeVisible, setCopyNoticeVisible] = useState(false);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [draftPrompt, setDraftPrompt] = useState("");
    const [isPromptExpanded, setIsPromptExpanded] = useState(false);
    const [isEditOverflow, setIsEditOverflow] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showMicWhileTransition, setShowMicWhileTransition] = useState(false);
    const recognitionRef = useRef(null);

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
        const maxHeight = lineHeight * MAX_EDIT_LINES + paddingTop + paddingBottom;

        textarea.style.height = 'auto';
        const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${nextHeight}px`;
        setIsEditOverflow(textarea.scrollHeight > maxHeight);
    }, [isEditingPrompt, draftPrompt]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setShowMicWhileTransition(true);
                setTimeout(() => {
                    setIsListening(false);
                }, MIC_STOP_DELAY);
                setTimeout(() => {
                    setShowMicWhileTransition(false);
                }, MIC_TRANSITION_DELAY);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [setInput]);

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
        setShowFileMenu(false);
    };

    const handlePhotosClick = () => {
        if (photoInputRef.current) {
            photoInputRef.current.click();
        }
        setShowFileMenu(false);
    };

    const handleFileChange = useCallback((event) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
        }
        event.target.value = '';
    }, []);

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
            }, TOAST_DURATION);
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

    const handleUpdatePrompt = async () => {
        setIsEditingPrompt(false);
        setIsPromptExpanded(false);
        await editAndResend(draftPrompt);
    };

    const getPromptSentences = (text) => {
        return text.split(/(?<=[.!?])\s+/).filter(Boolean);
    };

    const lastUserMessageIndex = useMemo(() => {
        return messages.findLastIndex(m => m.role === 'user');
    }, [messages]);

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
                    <button className="copy-toast-action" type="button" onClick={newChatAnimated}>Start new chat</button>
                </div>
            )}
            <nav className={`navbar ${sidebarExtended ? 'sidebar-extended' : ''}`}>
                <p className="navbar-brand">Gemini</p>
            </nav>
            <div className="main-container">
                {!showResult
                ? <>
                    <div className={`greet ${isResetting ? 'greeting-hidden' : 'greeting-visible'}`}>
                        <p><span>Hello!</span></p>
                        <p>How can I help you today?</p>
                    </div>
                </>
                : <div className="result">
                    {messages.map((message, index) => {
                        const isLastUserMessage = message.role === 'user' &&
                            index === lastUserMessageIndex;
                        const isLastMessage = index === messages.length - 1;

                        if (message.role === 'user') {
                            const msgSentences = getPromptSentences(message.content);
                            const msgHasMore = msgSentences.length > 5;
                            const msgPromptText = (isLastUserMessage && isPromptExpanded) || !msgHasMore
                                ? message.content
                                : msgSentences.slice(0, 5).join(" ");

                            return (
                                <div key={message.timestamp} className="result-user">
                                    {isLastUserMessage && !isEditingPrompt && (
                                        <div className="prompt-actions">
                                            <button className="copy-prompt" type="button" onClick={handleCopyPrompt}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                                                </svg>
                                                <span className="icon-tooltip">Copy prompt</span>
                                            </button>
                                            <button className="edit-prompt" type="button" onClick={handleEditPrompt}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                                </svg>
                                                <span className="icon-tooltip">Edit prompt</span>
                                            </button>
                                        </div>
                                    )}
                                    {isLastUserMessage && isEditingPrompt ? (
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
                                    ) : (
                                        <div className="user-bubble">
                                            {isLastUserMessage && msgHasMore && (
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
                                            <p>{msgPromptText}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            return (
                                <div key={message.timestamp} className="result-data">
                                    <img src={assets.gemini_icon} alt="Gemini" className="assistant-icon" />
                                    <div className="assistant-bubble">
                                        <p dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(message.content)}}></p>
                                    </div>
                                </div>
                            );
                        }
                    })}
                    {loading && (
                        <div className="result-data">
                            <img src={assets.gemini_icon} alt="Gemini" className="assistant-icon" />
                            <div className="loader" role="status" aria-label="Loading response">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                }

                <div className={`main-bottom ${showResult ? 'fixed-bottom' : ''} ${isResetting ? 'greeting-hidden' : 'greeting-visible'} ${sidebarExtended ? 'sidebar-extended' : ''}`}>
                    <div className="search-box">
                        <div
                            className={`plus-icon-wrapper ${showFileMenu ? 'is-active' : ''}`}
                            ref={fileMenuRef}
                        >
                            <button
                                type="button"
                                className="plus-icon-btn"
                                onClick={() => setShowFileMenu(!showFileMenu)}
                                aria-label="Add files"
                                aria-expanded={showFileMenu}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="plus-icon"
                                    viewBox="0 0 16 16"
                                    aria-hidden="true"
                                >
                                    <line x1="8" y1="2" x2="8" y2="14"/>
                                    <line x1="2" y1="8" x2="14" y2="8"/>
                                </svg>
                            </button>
                            {!showFileMenu && <span className="icon-tooltip">Add files</span>}
                            {showFileMenu && (
                                <div className="file-menu" role="menu">
                                    <button type="button" className="file-menu-item" onClick={handleUploadClick} role="menuitem">
                                        <img src={assets.upload_icon} alt="" style={{width: '18px', height: '18px'}} aria-hidden="true" />
                                        <span>Upload files</span>
                                    </button>
                                    <button type="button" className="file-menu-item" onClick={handlePhotosClick} role="menuitem">
                                        <img src={assets.photos_icon} alt="" style={{width: '18px', height: '18px'}} aria-hidden="true" />
                                        <span>Photos</span>
                                    </button>
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
                            ref={photoInputRef}
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <input
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            type="text"
                            placeholder="Ask Gemini"
                            aria-label="Chat message input"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && input.trim()) {
                                    e.preventDefault();
                                    onSent();
                                }
                            }}
                        />
                        <div className="search-icons">
                            {input && !isListening && !showMicWhileTransition ? (
                                <button type="button" className="send-icon-wrapper" onClick={() => onSent()} aria-label="Send message">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="send-icon icon-slide-in" viewBox="0 0 16 16" aria-hidden="true">
                                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                    </svg>
                                    <span className="icon-tooltip">Submit</span>
                                </button>
                            ) : (
                                <button type="button" className={`mic-icon-wrapper ${isListening ? 'is-listening' : ''}`} onClick={handleMicClick} aria-label={isListening ? 'Stop listening' : 'Use microphone'}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="mic-icon icon-slide-in" viewBox="0 0 16 16" aria-hidden="true">
                                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                    <span className="icon-tooltip">{isListening ? 'Stop listening' : 'Use microphone'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
