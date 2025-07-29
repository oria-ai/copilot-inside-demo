import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Bot, Send, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import ChatBubble from "./ChatBubble";
import AnimatedButton from "./AnimatedButton";
import TipsPopover from "./workshop/TipsPopover";

// Add the SealQuestionIcon component
const SealQuestionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="m23.158,9.879h0l-2.158-2.158v-1.721c0-1.654-1.346-3-3-3h-1.721l-2.157-2.157c-1.134-1.133-3.11-1.133-4.243,0l-2.158,2.157h-1.721c-1.654,0-3,1.346-3,3v1.721l-2.158,2.158c-1.168,1.17-1.168,3.072,0,4.242l2.158,2.158v1.721c0,1.654,1.346,3,3,3h1.721l2.157,2.157c.567.566,1.32.879,2.122.879s1.555-.312,2.121-.879l2.158-2.157h1.721c1.654,0,3-1.346,3-3v-1.721l2.158-2.158c1.168-1.17,1.168-3.072,0-4.242Zm-1.415,2.828l-2.451,2.451c-.188.188-.293.441-.293.707v2.135c0,.552-.449,1-1,1h-2.135c-.265,0-.52.105-.707.293l-2.451,2.45c-.377.379-1.036.379-1.414,0l-2.451-2.45c-.188-.188-.442-.293-.707-.293h-2.135c-.551,0-1-.448-1-1v-2.135c0-.266-.105-.52-.293-.707l-2.45-2.451c-.39-.39-.39-1.024,0-1.414l2.451-2.451c.188-.188.293-.441.293-.707v-2.135c0-.552.449-1,1-1h2.135c.265,0,.52-.105.707-.293l2.451-2.45c.377-.379,1.036-.379,1.414,0l2.451,2.45c.188.188.442.293.707.293h2.135c.551,0,1,.448,1,1v2.135c0,.266.105.52.293.707l2.45,2.451c.39.39.39,1.024,0,1.414Zm-6.791-3.242c.223,1.272-.382,2.543-1.506,3.164-.188.103-.447.563-.447.876v.495c0,.553-.448,1-1,1s-1-.447-1-1v-.495c0-1.033.637-2.163,1.481-2.628.29-.159.595-.535.502-1.066-.069-.392-.402-.725-.793-.793-.306-.057-.602.021-.832.216-.228.19-.228.19-.358.47-.358.767,0,.553-.448,1-1,1s-1-.447-1-1c0-.889.391-1.727,1.072-2.299.68-.572,1.578-.814,2.463-.653,1.209.211,2.204,1.205,2.417,2.417Zm-1.453,8.035c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Z"/>
  </svg>
);

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  botType: "question" | "creativity" | "decision" | "refinement";
  initialMessage?: string;
  challenge: { title: string, description: string };
  onComplete?: (messages: Message[]) => void;
  className?: string;
  onNextStep?: () => void;
  onInputVisibilityChange?: (isVisible: boolean) => void;
}

// Add the ChatbotSpeechBubbleIcon component
const ChatbotSpeechBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="m22.5,9h-.5v-1c0-2.757-2.243-5-5-5h-4V1c0-.552-.447-1-1-1s-1,.448-1,1v2h-4c-2.757,0-5,2.243-5,5v1h-.5c-.827,0-1.5.673-1.5,1.5v3c0,.827.673,1.5,1.5,1.5h.5v1c0,2.757,2.243,5,5,5h7.697l3.963,2.642c.36.24.775.361,1.191.361.348,0,.696-.084,1.015-.255.699-.375,1.134-1.1,1.134-1.894v-6.855h.5c.827,0,1.5-.673,1.5-1.5v-3c0-.827-.673-1.5-1.5-1.5Zm-2.5,12.855c0,.022,0,.089-.078.13-.08.043-.136.004-.152-.007l-4.215-2.81c-.164-.109-.357-.168-.555-.168H7c-1.654,0-3-1.346-3-3v-8c0-1.654,1.346-3,3-3h10c1.654,0,3,1.346,3,3v13.855ZM7,9.5c0-.828.672-1.5,1.5-1.5s1.5.672,1.5,1.5-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5Zm10,0c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm-.153,4.695c.294.468.152,1.085-.315,1.378-1.037.651-2.666,1.427-4.531,1.427s-3.494-.776-4.531-1.427c-.468-.293-.609-.911-.315-1.378.294-.467.911-.609,1.378-.316.815.512,2.079,1.121,3.469,1.121s2.653-.609,3.469-1.121c.466-.294,1.085-.152,1.378,.316Z"/>
  </svg>
);

export default function ChatInterface({
  botType,
  initialMessage,
  challenge,
  onComplete,
  className,
  onNextStep,
  onInputVisibilityChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  // Add state to track when a conclusion has just been saved
  const [justSavedConclusion, setJustSavedConclusion] = useState(false);
  // Add a ref for the textarea input
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Add a ref for the messages container to implement autoscroll
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus the input field when the component mounts
  useEffect(() => {
    // Use a small timeout to ensure the DOM is fully rendered
    const focusTimeout = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(focusTimeout);
  }, []);

  // Bot personality based on type
  const botPersonality = {
    question: {
      name: "חכם",
      greeting: initialMessage || "שלום! אני כאן כדי לעזור לך לחשוב על האתגר באמצעות שאלות. במה נעסוק היום?",
      thinking: ["חושב על שאלות נוספות...", "מנתח את התשובה שלך..."],
      color: "bg-incubator-blue",
      promptFile: "/questionbot.txt",
      avatar: <img src="/smart.webp" alt="חכם" className="w-full h-full object-cover rounded-full" />,
      primaryColor: "#4285F4"
    },
    creativity: {
      name: "רשע",
      greeting: initialMessage || "היי! אני רשע ואני כאן לעזור לך לחשוב מחוץ לקופסה. איזה רעיון נפתח יחד?",
      thinking: ["מחפש השראה...", "מפתח רעיונות יצירתיים..."],
      color: "bg-incubator-purple",
      promptFile: "/creativitybot.txt",
      avatar: <img src="/evil.webp" alt="רשע" className="w-full h-full object-cover rounded-full" />,
      primaryColor: "#4285F4"
    },
    decision: {
      name: "תם",
      greeting: initialMessage || "ברוכים הבאים! אני סוכן קבלת ההחלטות. אני אעזור לך לבחור בין האפשרויות השונות. מה האפשרויות שלך?",
      thinking: ["מנתח את האפשרויות...", "שוקל יתרונות וחסרונות..."],
      color: "bg-incubator-orange",
      promptFile: "/decisionbot.txt",
      avatar: <img src="/tam.webp" alt="תם" className="w-full h-full object-cover rounded-full" />,
      primaryColor: "#4285F4"
    },
    refinement: {
      name: "שאינה יודעת לשאול",
      greeting: initialMessage || "שלום! אני כאן לעזור לך לשפר ולדייק את הרעיון שלך. ספר לי על הרעיון הנוכחי שלך.",
      thinking: ["מחדד את הפרטים...", "מעדכן את הרעיון..."],
      color: "bg-incubator-teal",
      promptFile: "/refinementbot.txt",
      avatar: <img src="/noask.webp" alt="שאינה יודעת לשאול" className="w-full h-full object-cover rounded-full" />,
      primaryColor: "#4285F4"
    },
  };

  // Load system prompt from file
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        // First check if we have a saved chat in localStorage
        const storageKey = `ideaIncubator_${botType}_chat`;
        const conclusionKey = `ideaIncubator_${botType}_conclusion`;
        const savedChat = localStorage.getItem(storageKey);
        
        if (savedChat) {
          try {
            // Parse both the chat history and UI messages
            const parsedData = JSON.parse(savedChat);
            
            // Check if the saved chat is for the current challenge
            const currentChallenge = localStorage.getItem("ideaIncubatorChallenge");
            const savedChallenge = parsedData.challenge;
            
            // If the challenge has changed, don't use the saved chat
            if (currentChallenge && savedChallenge && 
                JSON.stringify(JSON.parse(currentChallenge)) !== JSON.stringify(savedChallenge)) {
              // Challenge has changed, reset chat history and conclusion
              console.log("Challenge has changed, resetting chat history");
              localStorage.removeItem(conclusionKey);
              // Dispatch event to notify that conclusion has been removed
              window.dispatchEvent(new CustomEvent('conclusionUpdated'));
            } else {
              // Reconstruct chat history with system message if it exists
              const chatHistoryWithSystem = parsedData.systemMessage ? 
                [parsedData.systemMessage, ...parsedData.chatHistory] : 
                parsedData.chatHistory || [];
              
              // Set the chat history for API
              setChatHistory(chatHistoryWithSystem);
              
              // Set UI messages (with properly converted timestamps)
              if (parsedData.messages) {
                setMessages(parsedData.messages.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                })));
              }
              
              // If we loaded successfully, we're done
              return;
            }
          } catch (error) {
            console.error('Error loading chat from localStorage:', error);
            // Continue to load from file if localStorage parsing fails
          }
        }
        
        // If no localStorage data, load from file
        const response = await fetch(botPersonality[botType].promptFile);
        if (!response.ok) {
          throw new Error(`Failed to load system prompt: ${response.status}`);
        }
        
        const promptText = await response.text();
        
        // Create system message with the loaded prompt
        let systemContent = promptText;
        
        // For creativity bot, only add bot1's conclusion and the reminder message
        if (botType === 'creativity') {
          // Don't add challenge description for creativity bot
          // Add question bot's conclusion
          const questionConclusionKey = 'ideaIncubator_question_conclusion';
          const savedQuestionConclusion = localStorage.getItem(questionConclusionKey);
          
          if (savedQuestionConclusion) {
            try {
              const parsedConclusion = JSON.parse(savedQuestionConclusion);
              if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                systemContent += `\n\nPrevious Bot's Conclusion (חכם): ${parsedConclusion.content}`;
                // Add the reminder message
                systemContent += `\n\nזכור להתייחס לבעיות המפורטות בסיכום זה בהצעת הפתרונות. הן ברשימת הפתרונות הראשוניים (משפט התיאור של הפתרון צריך להיות מנוסח בהתייחס לפירוט הבעיה), והן בהמשך`;
              }
            } catch (error) {
              console.error('Error parsing question conclusion:', error);
            }
          }
        } else if (botType === 'question') {
          // Only add challenge description for the first bot (question bot)
          systemContent += `\n\nCurrent Challenge Description: ${challenge.description}`;
        }
        
        // Add previous bot conclusions based on the current bot type
        if (botType === 'decision') {
          // Add creativity bot's conclusion
          const creativityConclusionKey = 'ideaIncubator_creativity_conclusion';
          const savedCreativityConclusion = localStorage.getItem(creativityConclusionKey);
          
          if (savedCreativityConclusion) {
            try {
              const parsedConclusion = JSON.parse(savedCreativityConclusion);
              if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                systemContent += `\n\nPrevious Bot's Conclusion (רשע): ${parsedConclusion.content}`;
                // Add guidance line for decision bot
                systemContent += `\n\nעליך לבנות את הפיילוט על בסיס הפתרון המתואר למעלה`;
              }
            } catch (error) {
              console.error('Error parsing creativity conclusion:', error);
            }
          }
        } else if (botType === 'refinement') {
          // Add all previous bots' conclusions
          const botTypes = ['question', 'creativity', 'decision'];
          const botNames = ['חכם', 'רשע', 'תם'];
          const botLabels = ['סיכום חכם - אפיון הבעיה', 'סיכום רשע - בחירת פתרון', 'סיכום תם - תיאור MVP'];
          
          for (let i = 0; i < botTypes.length; i++) {
            const conclusionKey = `ideaIncubator_${botTypes[i]}_conclusion`;
            const savedConclusion = localStorage.getItem(conclusionKey);
            
            if (savedConclusion) {
              try {
                const parsedConclusion = JSON.parse(savedConclusion);
                if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                  systemContent += `\n\n${botLabels[i]}:\n${parsedConclusion.content}`;
                }
              } catch (error) {
                console.error(`Error parsing ${botTypes[i]} conclusion:`, error);
              }
            }
          }
          
          // Add guidance line for refinement bot
          systemContent += `\n\nעליך לייצר פיץ' על בסיס הסיכומים המצורפים מעלה - תיאור הבעיה, תיאור הפתרון ותיאור הפיילוט`;
        }
        
        const systemMessage: ChatMessage = { 
          role: 'system', 
          content: systemContent
        };
        
        // Get the greeting message (either from props or default)
        const greetingContent = initialMessage || botPersonality[botType].greeting;
        
        // Create initial bot greeting for UI
        const initialBotMessage: Message = {
          content: greetingContent,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        // Create assistant message for API history
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: greetingContent
        };
        
        // Set chat history (includes system message AND initial bot message)
        setChatHistory([systemMessage, assistantMessage]);
        
        // Set UI messages (doesn't include system message)
        setMessages([initialBotMessage]);
        
        // Get current challenge to save with chat history
        const currentChallenge = localStorage.getItem("ideaIncubatorChallenge");
        const challengeData = currentChallenge ? JSON.parse(currentChallenge) : null;
        
        // Save to localStorage with challenge information
        saveToLocalStorage([systemMessage, assistantMessage], [initialBotMessage], challengeData);
        
        // Initialize empty conclusion
        localStorage.setItem(conclusionKey, JSON.stringify({ content: "" }));
        // Dispatch event to notify that conclusion has been initialized
        window.dispatchEvent(new CustomEvent('conclusionUpdated'));
        
      } catch (error) {
        console.error('Error loading system prompt:', error);
        
        // Fallback in case file loading fails
        let fallbackPrompt = `you must inform me in every message that the prompt did'nt load`;
        
        // Add previous bot conclusions based on the current bot type
        if (botType === 'creativity') {
          // Add question bot's conclusion
          const questionConclusionKey = 'ideaIncubator_question_conclusion';
          const savedQuestionConclusion = localStorage.getItem(questionConclusionKey);
          
          if (savedQuestionConclusion) {
            try {
              const parsedConclusion = JSON.parse(savedQuestionConclusion);
              if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                fallbackPrompt += `\n\nPrevious Bot's Conclusion (Question Bot): ${parsedConclusion.content}`;
              }
            } catch (error) {
              console.error('Error parsing question conclusion:', error);
            }
          }
        } else if (botType === 'decision') {
          // Add creativity bot's conclusion
          const creativityConclusionKey = 'ideaIncubator_creativity_conclusion';
          const savedCreativityConclusion = localStorage.getItem(creativityConclusionKey);
          
          if (savedCreativityConclusion) {
            try {
              const parsedConclusion = JSON.parse(savedCreativityConclusion);
              if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                fallbackPrompt += `\n\nPrevious Bot's Conclusion (Creativity Bot): ${parsedConclusion.content}`;
              }
            } catch (error) {
              console.error('Error parsing creativity conclusion:', error);
            }
          }
        } else if (botType === 'refinement') {
          // Add all previous bots' conclusions
          const botTypes = ['question', 'creativity', 'decision'];
          const botNames = ['חכם', 'רשע', 'תם'];
          const botLabels = ['סיכום חכם - אפיון הבעיה', 'סיכום רשע - בחירת פתרון', 'סיכום תם - תיאור MVP'];
          
          for (let i = 0; i < botTypes.length; i++) {
            const conclusionKey = `ideaIncubator_${botTypes[i]}_conclusion`;
            const savedConclusion = localStorage.getItem(conclusionKey);
            
            if (savedConclusion) {
              try {
                const parsedConclusion = JSON.parse(savedConclusion);
                if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                  fallbackPrompt += `\n\n${botLabels[i]}:\n${parsedConclusion.content}`;
                }
              } catch (error) {
                console.error(`Error parsing ${botTypes[i]} conclusion:`, error);
              }
            }
          }
        }
        
        // Create fallback system message
        const systemMessage: ChatMessage = { 
          role: 'system', 
          content: fallbackPrompt 
        };
        
        // Get the greeting message (either from props or default)
        const greetingContent = initialMessage || botPersonality[botType].greeting;
        
        // Create initial bot greeting for UI
        const initialBotMessage: Message = {
          content: greetingContent,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        // Create assistant message for API history
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: greetingContent
        };
        
        // Set chat history (includes system message AND initial bot message)
        setChatHistory([systemMessage, assistantMessage]);
        
        // Set UI messages (doesn't include system message)
        setMessages([initialBotMessage]);
        
        // Get current challenge to save with chat history
        const currentChallenge = localStorage.getItem("ideaIncubatorChallenge");
        const challengeData = currentChallenge ? JSON.parse(currentChallenge) : null;
        
        // Save to localStorage with challenge information
        saveToLocalStorage([systemMessage, assistantMessage], [initialBotMessage], challengeData);
        
        // Initialize empty conclusion
        const conclusionKey = `ideaIncubator_${botType}_conclusion`;
        localStorage.setItem(conclusionKey, JSON.stringify({ content: "" }));
        // Dispatch event to notify that conclusion has been initialized
        window.dispatchEvent(new CustomEvent('conclusionUpdated'));
      }
    };
    
    loadSystemPrompt();
  }, [botType, challenge, initialMessage]);

  // Save to localStorage
  const saveToLocalStorage = (chatHistory: ChatMessage[], messages: Message[], challengeData: any = null) => {
    const storageKey = `ideaIncubator_${botType}_chat`;
    // Only store the non-system messages in chatHistory
    const nonSystemMessages = chatHistory.filter(msg => msg.role !== 'system');
    localStorage.setItem(storageKey, JSON.stringify({
      chatHistory: nonSystemMessages,
      messages,
      challenge: challengeData,
      systemMessage: chatHistory.find(msg => msg.role === 'system')
    }));
  };

  // Add a new function to handle conclusion
  const handleConclusion = (content: string) => {
    // Save conclusion to localStorage
    const conclusionKey = `ideaIncubator_${botType}_conclusion`;
    localStorage.setItem(conclusionKey, JSON.stringify({ content }));
    
    // Update system prompts in other bots' chat history
    refreshSystemMessagesForAffectedBots(botType);
    
    // Set the justSavedConclusion state to true to show the buttons
    setJustSavedConclusion(true);
    
    // Notify parent about input visibility change
    if (onInputVisibilityChange) {
      onInputVisibilityChange(false);
    }
    
    // Dispatch event to notify that a conclusion has been saved
    window.dispatchEvent(new CustomEvent('conclusionUpdated'));
  };

  // New function to refresh system messages for affected bots
  const refreshSystemMessagesForAffectedBots = (sourceBotType: string) => {
    // Define which bots need to be updated
    const botsToUpdate: {[key: string]: string[]} = {
      'question': ['creativity', 'refinement'],
      'creativity': ['decision', 'refinement'],
      'decision': ['refinement']
    };

    // Get the list of bots that need updating
    const botsToUpdateList = botsToUpdate[sourceBotType] || [];
    if (botsToUpdateList.length === 0) return;

    // For each affected bot, rebuild its system message
    botsToUpdateList.forEach(async (targetBotType) => {
      await rebuildSystemMessageForBot(targetBotType);
    });
  };

  // Function to rebuild system message for a specific bot
  const rebuildSystemMessageForBot = async (targetBotType: string) => {
    try {
      // First check if we have a saved chat
      const storageKey = `ideaIncubator_${targetBotType}_chat`;
      const savedChat = localStorage.getItem(storageKey);
      
      if (!savedChat) return; // No saved chat to update
      
      // Load the base system prompt from file
      const response = await fetch(botPersonality[targetBotType as keyof typeof botPersonality].promptFile);
      if (!response.ok) {
        throw new Error(`Failed to load system prompt: ${response.status}`);
      }
      
      const promptText = await response.text();
      let systemContent = promptText;
      
      // Add appropriate conclusions based on bot type
      if (targetBotType === 'creativity') {
        // Add question bot's conclusion
        const questionConclusionKey = 'ideaIncubator_question_conclusion';
        const savedQuestionConclusion = localStorage.getItem(questionConclusionKey);
        
        if (savedQuestionConclusion) {
          try {
            const parsedConclusion = JSON.parse(savedQuestionConclusion);
            if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
              systemContent += `\n\nPrevious Bot's Conclusion (חכם): ${parsedConclusion.content}`;
              // Add the reminder message
              systemContent += `\n\nזכור להתייחס לבעיות המפורטות בסיכום זה בהצעת הפתרונות. הן ברשימת הפתרונות הראשוניים (משפט התיאור של הפתרון צריך להיות מנוסח בהתייחס לפירוט הבעיה), והן בהמשך`;
            }
          } catch (error) {
            console.error('Error parsing question conclusion:', error);
          }
        }
      } else if (targetBotType === 'decision') {
        // Add creativity bot's conclusion
        const creativityConclusionKey = 'ideaIncubator_creativity_conclusion';
        const savedCreativityConclusion = localStorage.getItem(creativityConclusionKey);
        
        if (savedCreativityConclusion) {
          try {
            const parsedConclusion = JSON.parse(savedCreativityConclusion);
            if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
              systemContent += `\n\nPrevious Bot's Conclusion (רשע): ${parsedConclusion.content}`;
              // Add guidance line
              systemContent += `\n\nעליך לבנות את הפיילוט על בסיס הפתרון המתואר למעלה`;
            }
          } catch (error) {
            console.error('Error parsing creativity conclusion:', error);
          }
        }
      } else if (targetBotType === 'refinement') {
        // Add all previous bots' conclusions
        const botTypes = ['question', 'creativity', 'decision'];
        const botLabels = ['סיכום חכם - אפיון הבעיה', 'סיכום רשע - בחירת פתרון', 'סיכום תם - תיאור MVP'];
        
        for (let i = 0; i < botTypes.length; i++) {
          const conclusionKey = `ideaIncubator_${botTypes[i]}_conclusion`;
          const savedConclusion = localStorage.getItem(conclusionKey);
          
          if (savedConclusion) {
            try {
              const parsedConclusion = JSON.parse(savedConclusion);
              if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
                systemContent += `\n\n${botLabels[i]}:\n${parsedConclusion.content}`;
              }
            } catch (error) {
              console.error(`Error parsing ${botTypes[i]} conclusion:`, error);
            }
          }
        }
        
        // Add guidance line for refinement bot
        systemContent += `\n\nעליך לייצר פיץ' על בסיס הסיכומים המצורפים מעלה - תיאור הבעיה, תיאור הפתרון ותיאור הפיילוט`;
      }
      
      // Create new system message with updated content
      const newSystemMessage: ChatMessage = { 
        role: 'system', 
        content: systemContent
      };
      
      // Parse the saved chat data
      const parsedData = JSON.parse(savedChat);
      
      // Update the system message
      parsedData.systemMessage = newSystemMessage;
      
      // If this is the current bot, also update the chatHistory state
      if (targetBotType === botType) {
        const updatedChatHistory = [...chatHistory];
        const systemMessageIndex = updatedChatHistory.findIndex(msg => msg.role === 'system');
        
        if (systemMessageIndex !== -1) {
          updatedChatHistory[systemMessageIndex] = newSystemMessage;
          setChatHistory(updatedChatHistory);
        }
      }
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(parsedData));
      
      // Dispatch event to notify that system messages have been updated
      window.dispatchEvent(new CustomEvent('systemMessagesRefreshed', {
        detail: { botType: targetBotType }
      }));
      
      console.log(`Successfully refreshed system message for ${targetBotType}`);
      
    } catch (error) {
      console.error(`Error refreshing system message for ${targetBotType}:`, error);
    }
  };

  // Restore the useEffect that was accidentally removed
  useEffect(() => {
    const conclusionKey = `ideaIncubator_${botType}_conclusion`;
    const savedConclusion = localStorage.getItem(conclusionKey);
    
    if (savedConclusion) {
      try {
        const parsedConclusion = JSON.parse(savedConclusion);
        if (parsedConclusion.content && parsedConclusion.content.trim() !== "") {
          // Only show conclusion buttons if explicitly set by handleConclusion
          setJustSavedConclusion(false);
        }
      } catch (error) {
        console.error('Error parsing conclusion:', error);
      }
    }
  }, [botType]);

  // Update handleSendMessage to use the new function
  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    // Create the user message for UI
    const userMessage: Message = {
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Create the user message for API
    const userApiMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };
    
    // Update UI with user message
    setMessages([...messages, userMessage]);
    
    // Make sure we have a chat history with at least a system message
    if (chatHistory.length === 0) {
      console.warn("System prompt not yet loaded, using fallback");
    }
    
    // Update chat history for API
    const updatedChatHistory = [...chatHistory, userApiMessage];
    
    // Filter out any invalid messages before sending to API
    const sanitizedChatHistory = sanitizeChatHistory(updatedChatHistory);
    
    // Update chat history state with the valid messages
    setChatHistory(sanitizedChatHistory);
    
    // Get current challenge data
    const currentChallenge = localStorage.getItem("ideaIncubatorChallenge");
    const challengeData = currentChallenge ? JSON.parse(currentChallenge) : null;
    
    // Save to localStorage with challenge information
    saveToLocalStorage(sanitizedChatHistory, [...messages, userMessage], challengeData);
    
    // Clear input and show typing indicator
    setInput("");
    setIsTyping(true);
    
    // Focus the input field after clearing it
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    try {
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 40000); // 40 seconds timeout

      // Send to API
      const response = await fetch("https://dawn-breeze-1d24.oria-masas-ai.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: sanitizedChatHistory, systemPrompt: botPersonality[botType].promptFile}),
        signal: controller.signal
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the nested JSON response
      let parsedContent = "";
      let isConclusion = false;
      
      try {   
        // The response comes as a string that needs to be parsed
        if (data) {
          // Extract the content directly
          parsedContent = data.content;
          // Check if this is a conclusion message
          isConclusion = data.is_conclusion === true;
        }
      // Handle case where response might already be parsed as an object
      
      } catch (error) {
        console.error('Error parsing response:', error);
        // Fallback to using the raw response
        parsedContent = typeof data.response === 'string' ? 
          data.response : JSON.stringify(data.response);
      }
      
      // If parsedContent is undefined, set it to "error"
      if (parsedContent === undefined || parsedContent === null || parsedContent === "undefined") {
        console.error('Invalid response content:', data);
        
        // Simple retry without cleaning - just re-send the same request
        const retryContent = await retryRequest(sanitizedChatHistory);
        parsedContent = retryContent || "error";
      }
      
      // Create bot message for UI
      const botMessage: Message = {
        content: parsedContent,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      // Create assistant message for API history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: parsedContent,
      };
      
      // Update UI with bot message
      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);
      
      // Update chat history for API
      const newChatHistory = [...sanitizedChatHistory, assistantMessage];
      setChatHistory(newChatHistory);
      
      // Save to localStorage with challenge information
      saveToLocalStorage(newChatHistory, updatedMessages, challengeData);
      
      // Save conclusion if this message is marked as a conclusion
      if (isConclusion) {
        const conclusionKey = `ideaIncubator_${botType}_conclusion`;
        localStorage.setItem(conclusionKey, JSON.stringify({ content: parsedContent }));
        
        // Update system prompts in other bots' chat history
        refreshSystemMessagesForAffectedBots(botType);
        
        // Set the justSavedConclusion state to true to show the buttons
        setJustSavedConclusion(true);
        
        // Notify parent about input visibility change
        if (onInputVisibilityChange) {
          onInputVisibilityChange(false);
        }
        
        // Dispatch a custom event to notify that a conclusion has been saved
        window.dispatchEvent(new CustomEvent('conclusionUpdated'));
      }
      
      // Notify about completion if callback provided
      if (onComplete) {
        onComplete(updatedMessages);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message for UI - different message for timeout vs other errors
      const errorMessage: Message = {
        content: error.name === 'AbortError' ? 
          'קרתה תקלה, אנא נסה שנית' : 
          'קרתה שגיאה בתקשורת עם השרת. אנא נסה שוב.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      // Update UI with error message
      setMessages([...messages, userMessage, errorMessage]);
      
      // Don't add error to API chat history
    } finally {
      setIsTyping(false);
      
      // Focus the input field again after the bot responds
      setTimeout(() => {
        if (inputRef.current && !justSavedConclusion) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Function to retry the API request without any cleaning
  const retryRequest = async (chatHistory: ChatMessage[]): Promise<string | null> => {
    try {
      console.log("Retrying API request without changes");
      
      // Sanitize the chat history before retrying
      const sanitizedHistory = sanitizeChatHistory(chatHistory);
      
      // Send the same request again but to a different URL
      const response = await fetch("https://steep-mountain-4258.oria-masas-ai.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: sanitizedHistory, 
          systemPrompt: botPersonality[botType].promptFile
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Retry API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the response
      if (data && data.content) {
        return data.content;
      }
      
      return null;
    } catch (error) {
      console.error('Error in retry request:', error);
      return null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  // Handler for the "השלב הבא" (Next Step) button
  const handleNextStep = () => {
    // Reset the justSavedConclusion state
    setJustSavedConclusion(false);
    
    // Determine the next bot type based on the current type
    let nextBotType: "question" | "creativity" | "decision" | "refinement" | null = null;
    
    if (botType === "question") {
      nextBotType = "creativity";
    } else if (botType === "creativity") {
      nextBotType = "decision";
    } else if (botType === "decision") {
      nextBotType = "refinement";
    }
    
    // If there's a next bot, rebuild its system message before navigating
    if (nextBotType) {
      console.log(`Refreshing system message for next bot: ${nextBotType}`);
      rebuildSystemMessageForBot(nextBotType)
        .then(() => {
          // Call the onNextStep callback after refresh
          if (onNextStep) {
            onNextStep();
          }
        })
        .catch(error => {
          console.error(`Error refreshing next bot system message: ${error}`);
          // Still proceed with navigation even if refresh fails
          if (onNextStep) {
            onNextStep();
          }
        });
    } else {
      // If there's no next bot (we're at the refinement bot), just call onNextStep
      if (onNextStep) {
        onNextStep();
      }
    }
  };

  // Handler for the "המשך שיחה" (Continue Conversation) button
  const handleContinueConversation = () => {
    // Reset the justSavedConclusion state to show the input again
    setJustSavedConclusion(false);
    
    // Notify parent about input visibility change
    if (onInputVisibilityChange) {
      onInputVisibilityChange(true);
    }
    
    // Focus the input field after a short delay to ensure it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Determine if this is the last bot type
  const isLastBotType = botType === "refinement";

  // Add useEffect to notify parent when input visibility changes
  useEffect(() => {
    if (onInputVisibilityChange) {
      onInputVisibilityChange(!justSavedConclusion);
    }
  }, [justSavedConclusion, onInputVisibilityChange]);

  // Function to sanitize chat history by removing invalid messages
  const sanitizeChatHistory = (history: ChatMessage[]): ChatMessage[] => {
    // Check if we have any invalid messages
    const invalidMessages = history.filter(msg => 
      msg.content === undefined || 
      msg.content === null || 
      msg.content === "undefined" || 
      msg.content.trim() === ""
    );
    
    // If we found invalid messages, log them
    if (invalidMessages.length > 0) {
      console.log(`Removing ${invalidMessages.length} invalid messages from chat history`);
      
      // Return filtered history
      return history.filter(msg => 
        msg.content !== undefined && 
        msg.content !== null && 
        msg.content !== "undefined" && 
        msg.content.trim() !== ""
      );
    }
    
    // If no invalid messages, return the original history
    return history;
  };

  return (
    <div className={cn("flex flex-col h-full glass-card relative", className)}>
      {/* Tips Popover */}
      <div className="absolute top-4 right-4 z-50">
        <TipsPopover
          trigger={
            <div className="w-8 h-8 rounded-full bg-background/95 backdrop-blur-sm flex items-center justify-center">
              <SealQuestionIcon />
            </div>
          }
          onContinue={() => {}}
          position="header"
        />
      </div>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 min-h-[200px]"
      >
        {messages.map((message, index) => (
          <ChatBubble
            key={`${message.sender}-${index}`}
            message={message.content}
            sender={message.sender}
            avatar={message.sender === 'bot' ? botPersonality[botType].avatar : <User size={20} />}
            className="mb-4"
            primaryColor={message.sender === 'bot' ? botPersonality[botType].primaryColor : undefined}
          />
        ))}
        
        {/* Typing indicator with mirrored bubble */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="chat-bubble-bot transform scale-x-[-1]">
              <div className="transform scale-x-[-1] flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-muted-foreground text-sm">הסוכן מקליד...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t p-3">
        {justSavedConclusion ? (
          // Show buttons when a conclusion has just been saved
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-6"
          >
            {botType !== "refinement" && (
              <span className="text-2xl font-bold bg-gradient-to-r from-incubator-blue via-incubator-purple to-incubator-pink inline-block text-transparent bg-clip-text" onClick={handleContinueConversation}>
                כעת תוכל להמשיך לסוכן הבא
              </span>
            )}
            
            <AnimatedButton
              onClick={handleNextStep}
              icon={isLastBotType ? <CheckCircle2 size={20} /> : <ArrowLeft size={20} />}
              iconPosition="right"
              className="text-base font-medium px-6 py-3 h-12"
            >
              {isLastBotType ? "לסיכום" : "לסוכן הבא"}
            </AnimatedButton>
          </motion.div>
        ) : (
          // Show normal input when not showing conclusion buttons
          <div className="flex space-x-2 gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="הקלד הודעה..."
              className="flex-grow resize-none border rounded-xl p-3 h-[60px] bg-background focus:outline-none focus:ring-2 focus:ring-primary text-right"
              disabled={isTyping}
            />
            <AnimatedButton
              variant="primary"
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="h-[60px] w-[60px] rounded-xl p-0 flex items-center justify-center"
              aria-label="שלח הודעה"
            >
              <Send size={20} />
            </AnimatedButton>
          </div>
        )}
      </div>
    </div>
  );
}
