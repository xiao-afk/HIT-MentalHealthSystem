import React, { useRef, useEffect, useState } from 'react';
import { Message, Role } from '../types';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: Message[];
  currentUserRole: Role;
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
  onInputChange?: (text: string) => void;
  inputValue?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  currentUserRole, 
  onSendMessage,
  isTyping,
  onInputChange,
  inputValue
}) => {
  const [localInput, setLocalInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use prop value if provided (controlled), otherwise local state
  const currentText = inputValue !== undefined ? inputValue : localInput;
  const handleTextChange = (text: string) => {
    setLocalInput(text);
    if (onInputChange) onInputChange(text);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentText.trim()) return;
    onSendMessage(currentText);
    handleTextChange('');
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Default to English, could be configurable

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleTextChange(currentText + (currentText ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10 text-sm">
            {currentUserRole === Role.PATIENT 
              ? "Hello, how can I help you today? You can type or speak to me."
              : "Waiting for patient to join..."}
          </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserRole;
          const isSystem = msg.isSystem;
          
          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-2">
                 <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                   {msg.content}
                 </span>
               </div>
             )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm
                  ${isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
              >
                <div className="font-semibold text-xs mb-1 opacity-80">
                  {msg.sender === Role.DOCTOR ? 'Dr. Smith' : (msg.sender === Role.AI ? 'AI Assistant' : 'Patient')}
                </div>
                {msg.content}
              </div>
            </div>
          );
        })}
        {isTyping && (
           <div className="flex justify-start animate-pulse">
             <div className="bg-slate-200 rounded-full h-8 w-12 flex items-center justify-center gap-1">
               <div className="h-1.5 w-1.5 bg-slate-400 rounded-full"></div>
               <div className="h-1.5 w-1.5 bg-slate-400 rounded-full"></div>
               <div className="h-1.5 w-1.5 bg-slate-400 rounded-full"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input 
          type="text"
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type a message..."}
          className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all
            ${isListening ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
        />
        <button 
          type="button" 
          title="Voice Input"
          className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-500 hover:bg-slate-100'}`}
          onClick={toggleVoiceInput}
        >
          <svg className="w-5 h-5" fill={isListening ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        </button>
        <Button type="submit" className="rounded-full !px-4" disabled={!currentText.trim() && !isListening}>
          <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </Button>
      </form>
    </div>
  );
};