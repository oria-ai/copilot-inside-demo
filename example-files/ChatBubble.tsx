import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { markdown } from "markdown";
import { RefreshCcw, AlertCircle } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  sender: "user" | "bot";
  avatar?: ReactNode;
  className?: string;
  primaryColor?: string;
}

export default function ChatBubble({
  message,
  sender,
  avatar,
  className,
  primaryColor,
}: ChatBubbleProps) {
  // Check if message is an error message or invalid
  const isErrorOrInvalid = message === "error" || message === undefined || message === null || message === "undefined";
  
  // Add state to track if the error timeout has elapsed
  const [showErrorButton, setShowErrorButton] = useState(false);
  
  // Set up timeout for error state
  useEffect(() => {
    if (isErrorOrInvalid && sender === "bot") {
      const timeoutId = setTimeout(() => {
        setShowErrorButton(true);
      }, 30000); // 10 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [isErrorOrInvalid, sender]);
  
  // Only process message as markdown if it's not an error
  const processedMessage = !isErrorOrInvalid ? markdown.toHTML(message) : "";
  
  // Create a style object for the bot bubble if primaryColor is provided
  const botBubbleStyle = sender === "bot" && primaryColor 
    ? { backgroundColor: primaryColor, color: "#ffffff" } 
    : {};
  
  // If it's an error message and from the bot, show loading or reload button based on timeout
  if (isErrorOrInvalid && sender === "bot") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center justify-center p-4",
          className
        )}
      >
        {showErrorButton ? (
          // Show reload button after timeout
          <div className="flex flex-col items-center gap-2 text-muted-foreground bg-muted/20 p-4 rounded-md">
            <AlertCircle size={24} className="text-destructive" />
            <span>חלה שגיאה בטעינת ההודעה</span>
            <button 
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw size={16} />
              <span>טען מחדש</span>
            </button>
          </div>
        ) : (
          // Show loading spinner initially
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCcw size={18} className="animate-spin" />
            <span>בעיה בתקשורת, מנסה שוב...</span>
          </div>
        )}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 mb-4 rtl",
        sender === "user" ? "justify-start" : "justify-end",
        className
      )}
    >
      {sender === "user" && avatar && (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-primary">
          {avatar}
        </div>
      )}
      <div
        style={botBubbleStyle}
        className={cn(
          sender === "user" 
            ? "chat-bubble-bot transform scale-x-[-1] bg-muted/80" 
            : "chat-bubble-user transform scale-x-[-1]",
          "rtl"
        )}
      >
        <div 
          className="transform scale-x-[-1] markdown-content px-2" 
          dangerouslySetInnerHTML={{ __html: processedMessage }} 
        />
      </div>
      {sender === "bot" && avatar && (
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
          {avatar}
        </div>
      )}
    </motion.div>
  );
}
