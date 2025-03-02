import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { disconnectSocket, getSocket } from '../socket/socket.server';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

// Code Editor
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

/**
 * EditorPage
 * 
 * This component represents a collaborative code editor and chat room.
 * 
 * Features:
 * - Real-time code editing and synchronization across users in the same room.
 * - Chat functionality with messages sent and received in real-time.
 * - Typing indicators to show when another user is typing.
 * - Buttons to copy the room ID and the current code to the clipboard.
 * - Ability to leave the room, which will navigate back to the home page.
 * 
 * State:
 * - `code`: Stores the current code being edited.
 * - `messages`: Stores the chat messages exchanged in the room.
 * - `isTyping`: Boolean indicating if someone is typing a message.
 * - `message`: Stores the current message being typed.
 * - `whoIsTyping`: Stores the username of the person currently typing.
 * 
 * Handlers:
 * - `handleTyping`: Emits a typing event to notify other users that the current user is typing.
 * - `sendMessage`: Sends the current message to other users in the room.
 * - `codeChange`: Emits a code change event to update the code for all users in the room.
 * - `leaveRoom`: Emits a leave room event and navigates back to the home page.
 * 
 * Effects:
 * - Initializes the socket connection and sets up event listeners for joining a room, 
 *   receiving messages, and detecting when users join or leave the room.
 * - Cleans up socket event listeners when the component unmounts.
 */

const EditorPage = () => {

    // States
    const navigate = useNavigate();
    const [code, setCode] = useState(`console.log('Hello, ${window.location.pathname.split('/').pop().replaceAll('%20', ' ')}')\nWrite your code here...`);
    const { roomId, username } = useParams();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState('');
    const [whoIsTyping, setWhoIsTyping] = useState('');
    const messageInputRef = useRef();

    // Handlers
    const handleTyping = () => {
        try {
            const socket = getSocket();
            socket.emit("typing", {
                roomId: roomId,
                username: username
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }
    }

    const sendMessage = () => {
        try {
            const socket = getSocket();
            if (!message) {
                setMessage('');
                messageInputRef.current.focus();
                return;
            }

            if (message.startsWith('@ai ')) {
                if (!message.slice(4)) {
                    setMessage('');
                    messageInputRef.current.focus();
                    return;
                }

                socket.emit("ask_ai", {
                    roomId: roomId,
                    username: username,
                    message: message, // Remove the '@ai ' prefix before sending
                    time: `${new Date().getHours()}:${new Date().getMinutes()}`
                });

                setMessage('');
                messageInputRef.current.focus();
                return;
            }

            socket.emit("op_message", {
                roomId: roomId,
                username: username,
                message: message,
                time: `${new Date().getHours()}:${new Date().getMinutes()}`
            });

            setMessage('');
            messageInputRef.current.focus();
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }
    }

    const codeChange = () => {
        try {
            const socket = getSocket();
            socket.emit("changing_code", {
                roomId: roomId,
                username: username,
                code: code,
                time: `${new Date().getHours()}:${new Date().getMinutes()}`
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }
    }

    const leaveRoom = () => {
        try {
            const socket = getSocket();
            socket.emit("leave_room", {
                roomId: roomId,
                username: username,
                time: `${new Date().getHours()}:${new Date().getMinutes()}`
            });

            navigate('/');
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }
    }

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.emit("join_room", {
                roomId: roomId,
                username: username,
                time: `${new Date().getHours()}:${new Date().getMinutes()}`
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }
    }, []);

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.on("new_user_joined", (data) => {
                toast(`${data.username} joined the room`);
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }

        return () => {
            try {
                const socket = getSocket();
                socket.off("new_user_joined");
            } catch (error) {
                disconnectSocket();
                navigate('/');
            }
        }
    }, []);

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.on("user_left", (data) => {
                toast(`${data.username} left the room`);
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }

        return () => {
            try {
                const socket = getSocket();
                socket.off("user_left");
            } catch (error) {
                disconnectSocket();
                navigate('/');
            }
        }
    }, []);

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.on("receive_message", (data) => {
                setMessages(p => {
                    return [...p, data];
                });
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }

        return () => {
            try {
                const socket = getSocket();
                socket.off("receive_message");
            } catch (error) {
                disconnectSocket();
                navigate('/');
            }
        }
    }, []);

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.on("someone_typing", (data) => {
                setIsTyping(true);
                setWhoIsTyping(data.username);
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }

        return () => {
            try {
                const socket = getSocket();
                socket.off("someone_typing");
            } catch (error) {
                disconnectSocket();
                navigate('/');
            }
        }
    }, []);

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.on("stop_typing", () => {
                setIsTyping(false);
                setWhoIsTyping('');
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }

        return () => {
            try {
                const socket = getSocket();
                socket.off("stop_typing");
            } catch (error) {
                disconnectSocket();
                navigate('/');
            }
        }
    }, []);

    useEffect(() => {
        try {
            const socket = getSocket();
            socket.on("code_change", (data) => {
                setCode(data.code);
                toast(data.message);
            });
        } catch (error) {
            disconnectSocket();
            navigate('/');
        }

        return () => {
            try {
                const socket = getSocket();
                socket.off("code_change");
            } catch (error) {
                disconnectSocket();
                navigate('/');
            }
        }
    }, []);

    return (
        <React.Fragment>
            <div className='h-screen p-2 w-full flex gap-2 bg-zinc-300 md:flex-row flex-col'>
                <div className='h-full w-full md:w-[30%] gap-1 rounded-md flex flex-col'>
                    <div className='flex flex-col scrollbar shadow-xl border-2 border-gray-300 p-4 pb-10 gap-4 overflow-y-auto bg-white rounded-xl h-full'>
                        {
                            messages.length > 0 && messages.map((message, index) => {
                                return (
                                    <div key={index} className='flex flex-col'>
                                        <div className='flex gap-2 items-center'>
                                            <span className='text-sm font-medium'>{message.username}</span>
                                            <span className='text-xs text-gray-500'>{message.time}</span>
                                        </div>
                                        <p className='text-sm'>{message.message}</p>
                                    </div>
                                )
                            })
                        }
                        {
                            isTyping && (
                                <div className='flex flex-col gap-1'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm font-medium'>{whoIsTyping}</span>
                                        <span className='text-xs text-gray-500'>typing...</span>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className='flex items-center gap-2 border-2 border-gray-300 rounded-full p-2 bg-white'>
                        <textarea ref={messageInputRef} value={message} onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }} rows={1} type="text" className='w-full resize-none p-2 rounded-md focus:outline-none scrollbar_none' />
                        <Send onClick={sendMessage} className='bg-blue-500 text-white p-1 rounded-full hover:bg-blue-700 transition duration-200 ease-in-out' />
                    </div>
                </div>
                <div className='h-full w-full md:w-[70%] p-2 flex flex-col rounded-lg overflow-hidden shadow-xl border-2 gap-2 bg-zinc-800 border-gray-300'>
                    <div className='overflow-hidden h-[95%] w-full border-none'>
                        <CodeMirror
                            value={code}
                            options={{
                                mode: 'javascript',
                                theme: {vscodeDark},
                                lineNumbers: true,
                                lineWrapping: true
                            }}
                            height="100%"
                            className='w-full text-xl h-full scrollbar rounded-xl overflow-hidden'
                            theme={vscodeDark}
                            lang='javascript'
                            onChange={(editor, data, value) => {
                                setCode(editor);
                            }}
                        />
                    </div>
                    <div className='gap-2 h-[5%] w-full flex items-center justify-center'>
                        <button onClick={codeChange} className='w-full bg-white p-2 rounded-md hover:bg-gray-200 font-medium transition duration-200 ease-in-out'>Save</button>
                        <button onClick={() => {
                            navigator.clipboard.writeText(roomId);
                            toast.success('Room Id copied to clipboard');
                        }} className='w-full bg-white font-medium p-2 rounded-md hover:bg-gray-200 transition duration-200 ease-in-out'>Copy Room Id</button>
                        <button onClick={() => {
                            navigator.clipboard.writeText(code);
                            toast.success('Code copied to clipboard');
                        }} className='w-full bg-blue-400 font-medium text-white p-2 rounded-md hover:bg-gray-200 transition duration-200 ease-in-out'>Copy Code</button>
                        <button onClick={leaveRoom} className='w-full bg-red-500 font-medium text-white p-2 rounded-md hover:bg-gray-200 transition duration-200 ease-in-out'>Leave Room</button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default EditorPage;
