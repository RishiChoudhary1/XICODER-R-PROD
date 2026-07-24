import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { role: 'user', parts: [{ text: "Hello" }] },
        { role: 'model', parts: [{ text: "Hi, I am Xi, How can I help you with this DSA problem?" }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const newUserMessage = { role: 'user', parts: [{ text: data.message }] };
        const updatedMessages = [...messages, newUserMessage];
        
        setMessages(updatedMessages);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: "Error. Please try again."}]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[500px] border border-gray-300 bg-white">
            
            {/* Chat Header */}
            <div className="bg-[#f5f5f5] border-b border-gray-300 px-4 py-2.5 text-sm text-gray-700 font-medium flex items-center gap-2">
                <Bot size={16} /> Xi
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#fafafa]">
                {messages.map((msg, index) => {
                    const isUser = msg.role === "user";
                    return (
                        <div 
                            key={index} 
                            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                                
                                {/* Avatar Icon */}
                                <div className={`shrink-0 w-8 h-8 flex items-center justify-center border ${
                                    isUser 
                                        ? 'bg-black text-white border-black' 
                                        : 'bg-white text-black border-gray-300'
                                }`}>
                                    {isUser ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                
                                {/* Message Box */}
                                <div className="p-3 text-sm whitespace-pre-wrap border bg-white border-gray-300 text-black leading-relaxed">
                                    {msg.parts[0].text}
                                </div>
                                
                            </div>
                        </div>
                    );
                })}
                
                {/* Temporary Loading Bubble */}
                {isLoading && (
                    <div className="flex w-full justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="shrink-0 w-8 h-8 flex items-center justify-center border bg-white text-black border-gray-300">
                                <Bot size={16} />
                            </div>
                            <div className="p-3 text-sm whitespace-pre-wrap border bg-white border-gray-300 text-gray-500 italic">
                                Thinking...
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="p-3 bg-white border-t border-gray-300 shrink-0"
            >
                <div className="flex items-stretch gap-2">
                    <input 
                        placeholder="Ask me anything about this problem..." 
                        className="flex-1 border border-gray-300 p-2.5 text-sm bg-white text-black outline-none focus:border-black rounded-none transition-colors" 
                        {...register("message", { required: true, minLength: 2 })}
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <button 
                        type="submit" 
                        className="shrink-0 px-5 bg-black text-white border border-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                        disabled={errors.message || isLoading}
                    >
                        <Send size={16} /> <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;