import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Play, MessageSquare, ArrowRight, Video } from 'lucide-react';

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
  toolCalls?: ToolCall[];
}

interface ConversationState {
  messages: ChatMessage[];
  lastResponseId?: string;
  model: string;
  updatedAt: number;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// OpenAI API configuration - PUT YOUR API KEY HERE
const OPENAI_API_KEY = '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'; // Replace with your actual API key
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

const ChatTask = ({ lessonId, onNext, handleActivityComplete }: ChatTaskProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    messages: [],
    model: "gpt-4o-mini",
    updatedAt: Date.now()
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingStartedRef = useRef<boolean>(false);

  // Storage key for this lesson's conversation
  const storageKey = `conversation_${lessonId}`;

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
        setSystemPrompt('אתה מדריך קופיילוט מועיל שעוזר למשתמשים ללמוד על מייקרוסופט קופיילוט. אתה יכול להציע כלים שונים כמו מעבר לתרגול, מתן משוב, מעבר לפעילות הבאה או הצגת וידאו רלוונטי. ענה בעברית בצורה ידידותית ומועילה.');
      }
    };
    
    loadSystemPrompt();
  }, []);

  // Load conversation state from localStorage
  useEffect(() => {
    const savedConversation = localStorage.getItem(storageKey);
    if (savedConversation) {
      try {
        const parsedConversation: ConversationState = JSON.parse(savedConversation);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedConversation.messages.map((msg: ChatMessage & { timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setConversationState({
          ...parsedConversation,
          messages: messagesWithDates
        });
        setMessages(messagesWithDates);
        setHasStarted(messagesWithDates.length > 0);
      } catch (error) {
        console.error('Error loading conversation state:', error);
      }
    }
  }, [lessonId]);

  // Save conversation state to localStorage whenever it changes
  useEffect(() => {
    if (conversationState.messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(conversationState));
    }
  }, [conversationState, storageKey]);

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

  const tools = [
    {
      type: "function",
      name: "go_to_clicktutor",
      description: "Navigate to the ClickTutor interactive tutorial",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Why the user should go to ClickTutor"
          }
        },
        required: ["reason"],
        additionalProperties: false
      },
      strict: false
    },
    {
      type: "function", 
      name: "give_feedback",
      description: "Provide feedback to the user about their progress or understanding",
      parameters: {
        type: "object",
        properties: {
          feedback: {
            type: "string",
            description: "The feedback message to give to the user"
          },
          save_flag: {
            type: "boolean",
            description: "Whether to save this feedback"
          }
        },
        required: ["feedback", "save_flag"],
        additionalProperties: false
      },
      strict: false
    },
    {
      type: "function",
      name: "move_on",
      description: "Move to the next activity or lesson",
      parameters: {
        type: "object", 
        properties: {
          next_activity: {
            type: "string",
            description: "The next activity to move to"
          }
        },
        required: ["next_activity"],
        additionalProperties: false
      },
      strict: false
    },
    {
      type: "function",
      name: "show_video",
      description: "Show a relevant video to the user",
      parameters: {
        type: "object",
        properties: {
          video_topic: {
            type: "string", 
            description: "The topic or title of the video to show"
          }
        },
        required: ["video_topic"],
        additionalProperties: false
      },
      strict: false
    }
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !systemPrompt) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

         // Add user message to chat and conversation state
     const updatedMessages = [...messages, userMessage];
     setMessages(updatedMessages);
     setInput('');
     setIsLoading(true);
     setHasStarted(true);

     try {
       const requestBody: Record<string, unknown> = {
         model: conversationState.model,
         instructions: systemPrompt,
         input: userMessage.content,
         tools: tools,
         tool_choice: "auto",
         parallel_tool_calls: true,
         stream: true,
         temperature: 0.7
       };

       // Add previous_response_id if we have one (for conversation continuity)
       if (conversationState.lastResponseId) {
         requestBody.previous_response_id = conversationState.lastResponseId;
         console.log('Using previous_response_id:', conversationState.lastResponseId);
       } else {
         console.log('First message in conversation - no previous_response_id');
       }

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
             const decoder = new TextDecoder();
       let buffer = '';
       
       // Track if we got a response ID and reset streaming started flag
       let responseId = '';
       streamingStartedRef.current = false;

             while (reader) {
         const { done, value } = await reader.read();
         if (done) break;

         buffer += decoder.decode(value, { stream: true });
         const lines = buffer.split('\n');
         buffer = lines.pop() || '';

         for (let i = 0; i < lines.length; i++) {
           const line = lines[i].trim();
           
           // Skip empty lines
           if (!line) continue;
           
           // Parse Server-Sent Events format
           if (line.startsWith('event:')) {
             const eventType = line.substring(6).trim();
             
             // Get the next line which should be the data
             if (i + 1 < lines.length && lines[i + 1].startsWith('data:')) {
               const dataLine = lines[i + 1].substring(5).trim();
               i++; // Skip the data line in next iteration
               
               if (!dataLine || dataLine === '[DONE]') continue;
               
                                try {
                   const data = JSON.parse(dataLine);
                   
                   // Debug logging
                   console.log('Event:', eventType, 'Data:', data);
                   
                   // Capture response ID for conversation continuity
                   if (eventType === 'response.created' || eventType === 'response.completed') {
                     if (data.response?.id) {
                       responseId = data.response.id;
                       console.log('Captured response ID:', responseId);
                     }
                   }
                   
                   // Handle text deltas
                   if (eventType === 'response.output_text.delta' && data.delta) {
                     console.log('Adding delta:', data.delta);
                     
                                            setMessages(prev => {
                         const newMessages = [...prev];
                         
                         // If streaming hasn't started, create the bot message
                         if (!streamingStartedRef.current) {
                           const botMessage: ChatMessage = {
                             id: generateMessageId(),
                             content: data.delta,
                             sender: 'bot',
                             timestamp: new Date()
                           };
                           streamingStartedRef.current = true;
                           return [...newMessages, botMessage];
                         }
                         
                         // Otherwise, append to the last bot message
                         const lastMessage = newMessages[newMessages.length - 1];
                         if (lastMessage.sender === 'bot') {
                           lastMessage.content += data.delta;
                         }
                         return newMessages;
                       });
                   }
                 // Handle function calls
                 else if (eventType === 'response.function_call.delta' && data.name) {
                   const toolCall: ToolCall = {
                     id: data.id || generateMessageId(),
                     name: data.name,
                     arguments: data.arguments || {}
                   };

                   setMessages(prev => {
                     const newMessages = [...prev];
                     const lastMessage = newMessages[newMessages.length - 1];
                     if (lastMessage.sender === 'bot') {
                       lastMessage.toolCalls = lastMessage.toolCalls || [];
                       lastMessage.toolCalls.push(toolCall);
                     }
                     return newMessages;
                   });
                 }
               } catch (error) {
                 console.error('Error parsing SSE data:', error, dataLine);
               }
             }
           }
           // Handle standalone data lines (fallback)
           else if (line.startsWith('data:')) {
             const dataLine = line.substring(5).trim();
             if (!dataLine || dataLine === '[DONE]') continue;
             
             try {
               const data = JSON.parse(dataLine);
               
               // Handle text deltas in standalone format
               if (data.type === 'response.output_text.delta' && data.delta) {
                 setMessages(prev => {
                   const newMessages = [...prev];
                   const lastMessage = newMessages[newMessages.length - 1];
                   if (lastMessage.sender === 'bot') {
                     lastMessage.content += data.delta;
                   }
                   return newMessages;
                 });
               }
             } catch (error) {
               console.error('Error parsing standalone data:', error);
             }
           }
                  }
       }

       // Update conversation state with the complete conversation and response ID
       // Only update if streaming actually started (we have a bot message)
       if (streamingStartedRef.current) {
         setMessages(currentMessages => {
           const botResponseMessage = currentMessages[currentMessages.length - 1];
           const finalMessages = [
             ...updatedMessages,
             botResponseMessage
           ];

           setConversationState(prev => ({
             ...prev,
             messages: finalMessages,
             lastResponseId: responseId || prev.lastResponseId,
             updatedAt: Date.now()
           }));

           console.log('Updated conversation state with response ID:', responseId);
           return currentMessages;
         });
       }

     } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        content: 'מצטער, אירעה שגיאה. אנא נסה שוב.',
        sender: 'bot',
        timestamp: new Date()
      };
      
             setMessages(prev => [...prev, errorMessage]);
       
       // Update conversation state with error message
       setConversationState(prev => ({
         ...prev,
         messages: [...prev.messages, errorMessage],
         updatedAt: Date.now()
       }));
    } finally {
      setIsLoading(false);
    }
  };

     const handleToolCall = (toolCall: ToolCall) => {
     console.log('Tool called:', toolCall.name, toolCall.arguments);
     
     switch (toolCall.name) {
       case 'go_to_clicktutor':
         alert(`נווט ל-ClickTutor: ${toolCall.arguments.reason as string}`);
         break;
       case 'give_feedback':
         if (toolCall.arguments.save_flag) {
           alert(`משוב נשמר: ${toolCall.arguments.feedback as string}`);
         } else {
           alert(`משוב: ${toolCall.arguments.feedback as string}`);
         }
         break;
       case 'move_on':
         alert(`עבור לפעילות הבאה: ${toolCall.arguments.next_activity as string}`);
         if (onNext) onNext();
         break;
       case 'show_video':
         alert(`הצג וידאו: ${toolCall.arguments.video_topic as string}`);
         break;
     }
   };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'go_to_clicktutor':
        return <Play className="w-4 h-4" />;
      case 'give_feedback':
        return <MessageSquare className="w-4 h-4" />;
      case 'move_on':
        return <ArrowRight className="w-4 h-4" />;
      case 'show_video':
        return <Video className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
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

  // Debug function to show conversation state
  const showConversationDebug = () => {
    console.log('Current conversation state:', {
      messageCount: conversationState.messages.length,
      lastResponseId: conversationState.lastResponseId,
      model: conversationState.model,
      updatedAt: new Date(conversationState.updatedAt).toLocaleString()
    });
  };

  // Clear conversation (for testing)
  const clearConversation = () => {
    localStorage.removeItem(storageKey);
    setConversationState({
      messages: [],
      model: "gpt-4o-mini", 
      updatedAt: Date.now()
    });
    setMessages([]);
    setHasStarted(false);
    console.log('Conversation cleared');
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
                 
                 {/* Tool call buttons */}
                 {message.toolCalls && message.toolCalls.length > 0 && (
                   <div className="mt-3 space-y-2">
                     {message.toolCalls.map((toolCall) => (
                       <Button
                         key={toolCall.id}
                         onClick={() => handleToolCall(toolCall)}
                         variant="outline"
                         size="sm"
                         className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                       >
                         {getToolIcon(toolCall.name)}
                         {toolCall.name.replace(/_/g, ' ')}
                       </Button>
                     ))}
                   </div>
                 )}
                 
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
           
           {/* Debug buttons - remove in production */}
           <div className="mt-2 flex gap-2 justify-center text-xs">
             <Button 
               onClick={showConversationDebug}
               variant="outline"
               size="sm"
               className="text-xs"
             >
               🐛 Debug Info
             </Button>
             <Button 
               onClick={clearConversation}
               variant="outline"
               size="sm"
               className="text-xs text-red-600 hover:text-red-700"
             >
               🗑️ Clear Chat
             </Button>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatTask; 