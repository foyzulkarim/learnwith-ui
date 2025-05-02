import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 h-8 w-8",
          isUser ? "ml-3" : "mr-3"
        )}>
          <Avatar>
            <AvatarFallback>
              {isUser ? 'U' : 'AI'}
            </AvatarFallback>
            <AvatarImage src={isUser ? "/user-avatar.png" : "/ai-avatar.png"} />
          </Avatar>
        </div>
        
        <div>
          <div className={cn(
            "px-4 py-2 rounded-lg text-sm",
            isUser 
              ? "bg-primary text-white rounded-tr-none" 
              : "bg-gray-100 text-gray-800 rounded-tl-none"
          )}>
            {message.content}
          </div>
          <div className={cn(
            "text-xs text-gray-500 mt-1",
            isUser ? "text-right" : "text-left"
          )}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}