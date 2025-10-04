'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { languageAtom } from '@/lib/language-atom';
import { chitraguptGuide, ChitraguptGuideInput } from '@/ai/flows/chitragupt-guide-flow';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

type ChatDialogProps = {
  children: ReactNode;
  contractContext?: ChitraguptGuideInput['contractContext'];
};

export function ChatDialog({ children, contractContext }: ChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const [language] = useAtom(languageAtom);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: crypto.randomUUID(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chitraguptGuide({ 
        question: input, 
        language,
        contractContext,
      });
      const aiMessage: Message = { id: crypto.randomUUID(), text: result.answer, sender: 'ai' };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: error.message || 'Could not get a response from ChitraGUPT.',
      });
       const errorMessage: Message = { id: crypto.randomUUID(), text: "Sorry, I couldn't get a response. Please try again.", sender: 'ai' };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getWelcomeMessage = () => {
    let baseWelcome = {
      'English': 'Hello! I am ChitraGUPT. How can I help you today?',
      'Hindi': 'नमस्ते! मैं चित्रगुप्त हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?',
    }[language];

    if (contractContext) {
      const docWelcome = {
        'English': ' I have the context for the current document. Feel free to ask me anything about it.',
        'Hindi': ' मेरे पास वर्तमान दस्तावेज़ का संदर्भ है। बेझिझक मुझसे इसके बारे में कुछ भी पूछें।',
      }[language];
      baseWelcome += docWelcome;
    }
    return baseWelcome;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat with ChitraGUPT</DialogTitle>
          <DialogDescription>
            {contractContext ? "Your AI guide for this document." : "Your AI guide to the ChitraGupt application."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
             <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border bg-primary text-primary-foreground">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted text-sm max-w-[85%]">
                    {getWelcomeMessage()}
                </div>
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' && 'flex-row-reverse'
                )}
              >
                <Avatar className={cn("w-8 h-8 border", message.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                  <AvatarFallback>{message.sender === 'ai' ? <Bot size={18}/> : <User size={18} />}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'p-3 rounded-lg text-sm max-w-[85%]',
                    message.sender === 'user' ? 'bg-accent text-accent-foreground' : 'bg-muted'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border bg-primary text-primary-foreground">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted text-sm">
                    <Loader2 className="w-5 h-5 animate-spin"/>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question in ${language}...`}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
