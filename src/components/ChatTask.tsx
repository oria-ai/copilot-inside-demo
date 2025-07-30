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
  const [pendingToolCall, setPendingToolCall] = useState<ToolCall | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
        // Inform user that prompt didn't load
        setSystemPrompt('שגיאה: לא הצלחתי לטעון את הוראות המערכת. אנא נסה לרענן את הדף.');
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
  }, [lessonId, storageKey]);

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
      description: "Navigate to the ClickTutor interactive tutorial for users who need orientation",
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
      }
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
      }
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
      }
    },
    {
      type: "function",
      name: "show_file",
      description: "when the user want the premade file for the exercise",
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
      }
    }
  ];

  const sendRequest = async (inputData: string | Array<{role: string, content?: string, name?: string, tool_call_id?: string} | {type: string, call_id?: string, name?: string, arguments?: string, output?: string}>, isFirstMessage: boolean = false) => {
    const requestBody: Record<string, unknown> = {
      model: conversationState.model,
      input: inputData,
      tools: tools,
      tool_choice: "auto",
      stream: true,
      temperature: 0.7
    };

    // Add previous_response_id if not the first message
    if (!isFirstMessage && conversationState.lastResponseId) {
      requestBody.previous_response_id = conversationState.lastResponseId;
      console.log('Using previous_response_id:', conversationState.lastResponseId);
    } else if (!isFirstMessage) {
      console.warn('Expected previous_response_id but none found');
    }

    console.log('Sending request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`);
    }

    return response;
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
     const updatedMessages = [...messages, userMessage];
     setMessages(updatedMessages);
     setInput('');
     setIsLoading(true);
     setHasStarted(true);

     try {
      let inputData;
      let isFirstMessage = false;

      // Determine if this is the first message in the conversation
      if (!conversationState.lastResponseId) {
        // First message: send system prompt + user message
        isFirstMessage = true;
        inputData = [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage.content }
        ];
       } else {
        // Subsequent message: only send user message
        inputData = [
          { role: "user", content: userMessage.content }
        ];
      }

      const response = await sendRequest(inputData, isFirstMessage);
      await processStreamingResponse(response, updatedMessages);

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

  const processStreamingResponse = async (response: Response, updatedMessages: ChatMessage[]) => {
    console.log('🔄 Starting to process streaming response');
      const reader = response.body?.getReader();
             const decoder = new TextDecoder();
       let buffer = '';
       
       let responseId = '';
     let currentBotMessage: ChatMessage | null = null;
     const pendingToolCalls: ToolCall[] = [];

             while (reader) {
         const { done, value } = await reader.read();
         if (done) break;

         buffer += decoder.decode(value, { stream: true });
         const lines = buffer.split('\n');
         buffer = lines.pop() || '';

         for (let i = 0; i < lines.length; i++) {
           const line = lines[i].trim();
           
           if (!line) continue;
           
           if (line.startsWith('event:')) {
             const eventType = line.substring(6).trim();
             
             if (i + 1 < lines.length && lines[i + 1].startsWith('data:')) {
               const dataLine = lines[i + 1].substring(5).trim();
               i++; // Skip the data line in next iteration
               
               if (!dataLine || dataLine === '[DONE]') continue;
               
                                try {
                   const data = JSON.parse(dataLine);
              console.log('🔴 SSE Event:', eventType);
              console.log('🔴 SSE Data:', JSON.stringify(data, null, 2));
                   
                   // Capture response ID for conversation continuity
              if ((eventType === 'response.created' || eventType === 'response.completed') && data.response?.id) {
                       responseId = data.response.id;
                console.log('✅ Captured response ID:', responseId);
              }
              
              // Handle function call creation
              if (eventType === 'response.output_item.added' && data.item?.type === 'function_call') {
                console.log('🔧 Function call detected:', data.item.name);
                
                // Create bot message if none exists
                if (!currentBotMessage) {
                  currentBotMessage = {
                    id: generateMessageId(),
                    content: '', // Function calls might not have text content
                    sender: 'bot',
                    timestamp: new Date(),
                    toolCalls: []
                  };
                  setMessages(prev => [...prev, currentBotMessage!]);
                  console.log('✅ Created bot message for function call');
                }
              }
              
              // Handle completed function call
              if (eventType === 'response.output_item.done' && data.item?.type === 'function_call') {
                console.log('🔧 Function call completed:', data.item);
                
                const toolCall: ToolCall = {
                  id: data.item.call_id || generateMessageId(),
                  name: data.item.name,
                  arguments: JSON.parse(data.item.arguments || '{}')
                };
                
                console.log('✅ Created tool call:', toolCall);
                
                if (currentBotMessage) {
                  currentBotMessage.toolCalls = [...(currentBotMessage.toolCalls || []), toolCall];
                                            setMessages(prev => {
                         const newMessages = [...prev];
                         const lastMessage = newMessages[newMessages.length - 1];
                         if (lastMessage.sender === 'bot') {
                      lastMessage.toolCalls = currentBotMessage!.toolCalls;
                         }
                         return newMessages;
                       });
                   }
                
                // Immediately execute tool and send result back to API
                pendingToolCalls.push(toolCall);
              }
              
                            // Handle text content deltas (for regular text responses)
              if (eventType === 'response.output_text.delta' && data.delta) {
                const deltaText = data.delta;
                
                console.log('✅ Found text delta:', deltaText);
                
                if (!currentBotMessage) {
                  currentBotMessage = {
                    id: generateMessageId(),
                    content: deltaText,
                    sender: 'bot',
                    timestamp: new Date(),
                    toolCalls: []
                  };
                  console.log('✅ Created new bot message for text');
                  setMessages(prev => [...prev, currentBotMessage!]);
                } else {
                  currentBotMessage.content += deltaText;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.sender === 'bot') {
                      lastMessage.content = currentBotMessage!.content;
                    }
                    return newMessages;
                  });
                }
              }
              
              // Handle other possible text delta formats (fallback)
              else if (eventType.includes('content') && eventType.includes('delta') && data.delta) {
                let deltaText = '';
                
                // Try different possible delta formats for text
                if (data.delta.text) {
                  deltaText = data.delta.text;
                } else if (typeof data.delta === 'string') {
                  deltaText = data.delta;
                }
                
                if (deltaText) {
                  console.log('✅ Found fallback text delta:', deltaText);
                  
                  if (!currentBotMessage) {
                    currentBotMessage = {
                      id: generateMessageId(),
                      content: deltaText,
                      sender: 'bot',
                      timestamp: new Date(),
                      toolCalls: []
                    };
                    console.log('✅ Created new bot message for fallback text');
                    setMessages(prev => [...prev, currentBotMessage!]);
                  } else {
                    currentBotMessage.content += deltaText;
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage.sender === 'bot') {
                        lastMessage.content = currentBotMessage!.content;
                      }
                      return newMessages;
                    });
                  }
                }
              }
              

              
               } catch (error) {
              console.error('❌ Error parsing SSE data:', error, dataLine);
               }
             }
           }
        // Handle standalone data lines (fallback for non-SSE format)
           else if (line.startsWith('data:')) {
             const dataLine = line.substring(5).trim();
             if (!dataLine || dataLine === '[DONE]') continue;
             
             try {
               const data = JSON.parse(dataLine);
            console.log('🔴 Standalone Data:', JSON.stringify(data, null, 2));
            
            // Handle direct text content or deltas
            let content = '';
            if (data.choices?.[0]?.delta?.content) {
              content = data.choices[0].delta.content;
            } else if (data.delta?.text) {
              content = data.delta.text;
            } else if (data.delta) {
              content = data.delta;
            } else if (data.text) {
              content = data.text;
            }
            
            if (content) {
              console.log('✅ Found standalone content:', content);
              
              if (!currentBotMessage) {
                currentBotMessage = {
                  id: generateMessageId(),
                  content: content,
                  sender: 'bot',
                  timestamp: new Date(),
                  toolCalls: []
                };
                console.log('✅ Created new bot message from standalone');
                setMessages(prev => [...prev, currentBotMessage!]);
              } else {
                currentBotMessage.content += content;
                 setMessages(prev => {
                   const newMessages = [...prev];
                   const lastMessage = newMessages[newMessages.length - 1];
                   if (lastMessage.sender === 'bot') {
                    lastMessage.content = currentBotMessage!.content;
                   }
                   return newMessages;
                 });
              }
               }
             } catch (error) {
            console.error('❌ Error parsing standalone data:', error);
          }
        }
      }
    }

    console.log('🔚 Finished processing stream. Bot message created:', !!currentBotMessage);
    console.log('🔚 Response ID captured:', responseId);
    console.log('🔚 Pending tool calls to execute:', pendingToolCalls.length);
    
    // Update conversation state with the complete conversation
    if (currentBotMessage) {
      const finalMessages = [...updatedMessages, currentBotMessage];

           setConversationState(prev => ({
             ...prev,
             messages: finalMessages,
             lastResponseId: responseId || prev.lastResponseId,
             updatedAt: Date.now()
           }));

      console.log('✅ Updated conversation state with response ID:', responseId);
    } else {
      console.log('⚠️  No bot message was created during streaming - this indicates an issue with response parsing');
      
      // Create a fallback bot message if none was created
      const fallbackMessage: ChatMessage = {
        id: generateMessageId(),
        content: 'מצטער, לא הצלחתי לקבל תגובה. אנא נסה שוב.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
       
      const finalMessages = [...updatedMessages, fallbackMessage];
       setConversationState(prev => ({
         ...prev,
        messages: finalMessages,
        lastResponseId: responseId || prev.lastResponseId,
         updatedAt: Date.now()
       }));
    }
    
    // Auto-execute any pending tool calls
    if (pendingToolCalls.length > 0) {
      console.log('🔧 Auto-executing pending tool calls...');
      for (const toolCall of pendingToolCalls) {
        await executeToolAutomatically(toolCall);
      }
    }
  };

  const executeToolAutomatically = async (toolCall: ToolCall) => {
    console.log('🔧 Auto-executing tool:', toolCall.name, toolCall.arguments);
    
    // Execute the tool locally and get result
    let toolResult = '';
     
    switch (toolCall.name) {
      case 'go_to_clicktutor':
        toolResult = `ClickTutor button displayed`;
        break;
      case 'give_feedback':
        toolResult = toolCall.arguments.save_flag ? `Feedback saved` : `Feedback displayed`;
        break;
      case 'move_on':
        toolResult = `Move on button displayed`;
        break;
      case 'show_file':
        toolResult = `File button displayed`;
        break;
      default:
        toolResult = `Button displayed`;
    }

    console.log('✅ Tool executed automatically, sending result back to API:', toolResult);

    try {
      // The input should include both the original function call AND the result
      const toolInput = [
        {
          type: "function_call",
          call_id: toolCall.id,
          name: toolCall.name,
          arguments: JSON.stringify(toolCall.arguments)
        },
        {
          type: "function_call_output", 
          call_id: toolCall.id,
          output: toolResult
        }
      ];

      const response = await sendRequest(toolInput, false);
      
      // Get current messages to pass to streaming
      const currentMessages = [...messages];
      await processStreamingResponse(response, currentMessages);
      
      console.log('✅ Tool result sent automatically, continuing conversation');
      
    } catch (error) {
      console.error('❌ Error sending tool result automatically:', error);
    }
  };

  const handleToolClick = (toolCall: ToolCall) => {
    console.log('🔧 Tool button clicked (display only):', toolCall.name);
    
    // Just show feedback to user, tool was already executed automatically
    let userFeedback = '';
    
    switch (toolCall.name) {
      case 'go_to_clicktutor':
        userFeedback = `נווט ל-ClickTutor: ${toolCall.arguments.reason as string}`;
        if (onNext) onNext(); // Still navigate when user clicks
        break;
      case 'give_feedback':
        userFeedback = toolCall.arguments.save_flag 
          ? `משוב נשמר: ${toolCall.arguments.feedback as string}`
          : `משוב: ${toolCall.arguments.feedback as string}`;
        break;
      case 'move_on':
        userFeedback = `עבור לפעילות הבאה: ${toolCall.arguments.next_activity as string}`;
        if (onNext) onNext(); // Still navigate when user clicks
        break;
      case 'show_file':
        userFeedback = `הצג קובץ: ${toolCall.arguments.video_topic as string}`;
        break;
      default:
        userFeedback = `פעולה בוצעה: ${toolCall.name}`;
    }
    
    console.log('ℹ️ User feedback:', userFeedback);
    // Could show a toast or alert here if needed
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'go_to_clicktutor':
        return <Play className="w-4 h-4" />;
      case 'give_feedback':
        return <MessageSquare className="w-4 h-4" />;
      case 'move_on':
        return <ArrowRight className="w-4 h-4" />;
      case 'show_file':
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
                          onClick={() => handleToolClick(toolCall)}
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                         disabled={isLoading}
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