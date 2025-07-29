import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User } from 'lucide-react';

interface ChatTaskProps {
  lessonId: string;
  onNext?: () => void;
  handleActivityComplete?: (lessonId: string, progress: number) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Same worker URL as PromptTask
const WORKER_URL = 'https://copilot-text.oria-masas-ai.workers.dev/';

const ChatTask = ({ lessonId, onNext, handleActivityComplete }: ChatTaskProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Storage key for this lesson's chat
  const storageKey = `chat_${lessonId}`;

  // Load system prompt from prompt1.txt
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        const response = await fetch('/prompt1.txt');
        if (!response.ok) {
          throw new Error('Failed to load system prompt');
        }
        const text = await response.text();
        setSystemPrompt(text);
      } catch (error) {
        console.error('Error loading system prompt:', error);
        // Fallback prompt
        setSystemPrompt('אתה עוזר מועיל שמנהל שיחה בעברית. ענה בצורה ידידותית ומועילה.');
      }
    };
    
    loadSystemPrompt();
  }, []);

  // Load chat history from localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem(storageKey);
    if (savedChat) {
      try {
        const parsedMessages = JSON.parse(savedChat);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        setHasStarted(messagesWithDates.length > 0);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, [lessonId]);

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !systemPrompt) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setHasStarted(true);

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          systemPrompt: systemPrompt,
          userInput: userMessage.content 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Request failed');
      }
      
      const data = await response.json();
      
      // Clean up response like in PromptTask
      let cleanedResponse = data.response || 'קיבלתי את הודעתך';
      
      // Remove any remaining markdown artifacts
      cleanedResponse = cleanedResponse
        .replace(/(?<!<strong>)\*(?!<\/strong>)/g, '') // Remove orphaned asterisks
        .replace(/\*{2,}/g, '') // Remove multiple asterisks
        .replace(/<strong>\s*<\/strong>/g, ''); // Remove empty strong tags

      const botMessage: ChatMessage = {
        id: generateMessageId(),
        content: cleanedResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      // Add bot response to chat
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        content: 'מצטער, אירעה שגיאה. אנא נסה שוב.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleComplete = () => {
    if (handleActivityComplete) {
      handleActivityComplete(lessonId, 90);
    }
    
    if (onNext) {
      onNext();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="!mb-0 !pb-0 flex flex-col h-full">
      <CardHeader>
        <CardTitle>שיחה עם קופיילוט</CardTitle>
        <p className="text-sm text-gray-600">נסה לנהל שיחה עם קופיילוט על הנושא שלמדנו</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
          {!hasStarted && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>התחל שיחה עם קופיילוט...</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-start' : 'justify-end'
              }`}
            >
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gradient-turquoise text-white'
                }`}
              >
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: message.content.replace(/\n/g, '<br>') 
                  }}
                />
                <div className={`text-xs mt-2 opacity-70 ${
                  message.sender === 'user' ? 'text-gray-500' : 'text-white'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              {message.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-turquoise flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-gradient-turquoise rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-turquoise flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="כתוב הודעה..."
                className="resize-none min-h-[60px] max-h-[120px] text-right"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !systemPrompt}
              className="px-4 py-3 h-[60px] bg-gradient-turquoise hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {hasStarted && messages.length >= 4 && (
            <div className="mt-4 text-center">
              <Button 
                onClick={handleComplete}
                variant="outline"
                className="px-8 py-2"
              >
                סיים שיחה והמשך
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatTask; 