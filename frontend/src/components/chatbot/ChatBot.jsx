import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { campusCopilotAgent } from '../../services/chatbotService';
import { v4 as uuidv4 } from 'uuid';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Hello! I'm Campus Copilot, your AI assistant for Novacore University. I can help you with:\n\n📅 **Class Schedules**\n🍽️ **Cafeteria Menus**\n🚌 **Bus Schedules**\n📢 **Events & Updates**\n❓ **FAQs**\n\nWhat would you like to know?",
      timestamp: new Date(),
      intent: 'greeting'
    };
    
    setMessages([welcomeMessage]);
  };
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Process message with intelligent agent
      const result = await campusCopilotAgent.processMessage(currentMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: result.response,
        timestamp: new Date(),
        intent: result.intent,
        confidence: result.confidence
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        intent: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        data-chatbot-toggle
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        } text-white`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <img 
                src="/NexoraLogo.png" 
                alt="Nexora AI" 
                className="w-6 h-6 object-contain"
              />
              <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >{/* Chat Header */}            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <img 
                    src="/NexoraLogo.png" 
                    alt="Nexora AI" 
                    className="w-5 h-5 object-contain"
                  />
                  <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-semibold">Campus Copilot AI</h3>
                  <p className="text-xs opacity-90 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Intelligent Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    }`}>
                      {message.type === 'user' ? (
                        <User size={16} />
                      ) : (
                        <img 
                          src="/NexoraLogo.png" 
                          alt="Nexora AI" 
                          className="w-4 h-4 object-contain"
                        />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg shadow-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border'
                    }`}>
                      {message.type === 'bot' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({children}) => <em className="text-gray-600">{children}</em>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                              li: ({children}) => <li className="mb-1">{children}</li>
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.intent && message.intent !== 'greeting' && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {message.intent} • {Math.round((message.confidence || 0) * 100)}% confidence
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white p-3 rounded-lg rounded-bl-none border shadow-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about schedules, menus, buses, events..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Send size={18} />
                </button>
              </div>
                {/* Quick Action Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { text: "Today's schedule", icon: "📅" },
                  { text: "Menu for today", icon: "🍽️" },
                  { text: "Bus timings", icon: "🚌" },
                  { text: "Upcoming events", icon: "📢" },
                  { text: "Tell me a joke", icon: "😄" },
                  { text: "Study tips", icon: "📚" },
                  { text: "Fun fact", icon: "🤓" },
                  { text: "Motivate me", icon: "💪" }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(action.text);
                      // Auto-send the message
                      setTimeout(() => {
                        const event = { key: 'Enter', shiftKey: false, preventDefault: () => {} };
                        handleKeyPress(event);
                      }, 100);
                    }}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 flex items-center space-x-1"
                    disabled={isTyping}
                  >
                    <span>{action.icon}</span>
                    <span>{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
