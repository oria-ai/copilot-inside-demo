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
        // Fallback prompt with full content
        setSystemPrompt(`אתה מורה פרטי בשיעור שימוש בקופיילוט בוורד.
אתה מתמחה בשימוש בקופיילוט בוורד, ונסמך על הידע שיצורף בהמשך.
יש לך 3 תפקידים - מורה הזמין לשאלות על החומר ועל הסרטון, מתרגל שמדריך את המשתמש בביצוע תרגול ומתן פידבק, ומלווה למידה ששולח את המשתמש למשימות שונות בהתאם להבנה שלו
1. לשמש כמדריך על קופיילוט בוורד, לסייע בשימוש, בביצוע, ובשאלות.
להלן הידע שלך על קופיילוט בוורד, ולאחר מכן תמלול של הסרטון שבו צפה המשתמש, על מנת שתוכל לעזור לו במידה ויש לו שאלות על הסרטון.
הידע התיאורטי שלך :
# Copilot בוורד – הידע התיאורטי

## מבוא

Copilot בוורד (Microsoft 365 Copilot) הוא סוכן בינה מלאכותית שמוטמע כחלק מ‑Word ומסוגל להפיק טיוטות, לשכתב, לסכם, לענות על שאלות ולתרגם מסמכים בזמן אמת על‑סמך פקודות שפה טבעית שניתנות בממשק וורד. הפעלתו מתבצעת בלחיצה על סמל Copilot (שתי טבעות משולבות) בפינה הימנית‑עליונה או בקיצור ‎Alt + I.

## דרישות מוקדמות

* רישיון Microsoft 365 עם Copilot (Pro/Enterprise) פעיל.
* חיבור לאינטרנט כדי לבצע עיבוד בענן.
* שמירת המסמך ב‑OneDrive או SharePoint לקבלת יכולות הקשר חוצות‑קבצים.
* גרסת Word: שולחן‑עבודה (Windows/Mac), Web או iPad.

## שימושים עיקריים

1. **יצירת טיוטה מלאה (Draft)** – מעבר מדף ריק לטקסט ראשוני על‑פי פרומפט.
2. **תיקון ושיפור טיוטה** – שימוש ב‑**תיבת החיבור** (שורת ההנחיה) שמופיעה מיד אחרי יצירת הטיוטה.
3. **שכתוב פסקאות ספציפיות** – בחירת טקסט קיים ולחיצה על **שכתב באמצעות Copilot**.
4. **סיכום ושאילתות** – בקשת תקציר או מענה לשאלות על תוכן המסמך.
5. **הזנת קבצים חיצוניים כהקשר** – הצמדת מסמכים נוספים כדי לשפר את התוצאה.
6. **תרגום מסמכים** – המרת המסמך לשפה אחרת תוך שמירה על עיצוב.

הכלים הזמינים לך:
1. go_to_clicktutor - כאשר המשתמש צריך תרגול מעשי או רוצה לחזור על התרגילים
2. give_feedback - כאשר אתה רוצה לתת משוב על הביצועים או ההבנה של המשתמש
3. move_on - כאשר המשתמש מוכן לעבור לפעילות הבאה
4. show_video - כאשר וידאו יכול לעזור להסביר נושא או להדגים תהליך

עקרונות חשובים:
- ענה בעברית בצורה ידידותית ומקצועית
- השתמש בכלים כאשר זה מתאים ויעיל
- עודד למידה אקטיבית ותרגול
- תן משוב בונה וחיובי
- הנח שהמשתמש כבר צפה בוידאו של השיעור

התחל את השיחה בברכה ושאל איך תוכל לעזור למשתמש עם לימוד קופיילוט.`);
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
      }
    }
  ];

  const sendRequest = async (inputData: string | Array<{role: string, content?: string, name?: string, tool_call_id?: string}>, isFirstMessage: boolean = false) => {
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
  };

  const handleToolCall = async (toolCall: ToolCall) => {
    console.log('🔧 Tool button clicked:', toolCall.name, toolCall.arguments);
    
    // Execute the tool locally and get result
    let toolResult = '';
    let userFeedback = '';
     
     switch (toolCall.name) {
       case 'go_to_clicktutor':
        toolResult = `ClickTutor button displayed and clicked. User is now navigating to interactive tutorial.`;
        userFeedback = `נווט ל-ClickTutor: ${toolCall.arguments.reason as string}`;
        // alert(userFeedback);
         break;
       case 'give_feedback':
        toolResult = `Feedback displayed to user: "${toolCall.arguments.feedback}". Save flag: ${toolCall.arguments.save_flag}`;
        userFeedback = toolCall.arguments.save_flag 
          ? `משוב נשמר: ${toolCall.arguments.feedback as string}`
          : `משוב: ${toolCall.arguments.feedback as string}`;
        // alert(userFeedback);
         break;
       case 'move_on':
        toolResult = `Move on button displayed and clicked. User is proceeding to: ${toolCall.arguments.next_activity}`;
        userFeedback = `עבור לפעילות הבאה: ${toolCall.arguments.next_activity as string}`;
        // alert(userFeedback);
         if (onNext) onNext();
         break;
       case 'show_video':
        toolResult = `Video button displayed and clicked. Video topic: ${toolCall.arguments.video_topic}`;
        userFeedback = `הצג וידאו: ${toolCall.arguments.video_topic as string}`;
        // alert(userFeedback);
         break;
      default:
        toolResult = `Tool "${toolCall.name}" executed successfully.`;
        userFeedback = `פעולה בוצעה: ${toolCall.name}`;
    }

    console.log('✅ Tool executed locally, sending result back to API:', toolResult);

    // Send tool result back to API automatically
    setIsLoading(true);
    
    try {
      const toolInput = [{
        role: "tool",
        name: toolCall.name,
        tool_call_id: toolCall.id,
        content: toolResult
      }];

      const response = await sendRequest(toolInput, false);
      
      // Get current messages to pass to streaming
      const currentMessages = [...messages];
      await processStreamingResponse(response, currentMessages);
      
      console.log('✅ Tool result sent, continuing conversation');
      
    } catch (error) {
      console.error('❌ Error sending tool result:', error);
    } finally {
      setIsLoading(false);
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