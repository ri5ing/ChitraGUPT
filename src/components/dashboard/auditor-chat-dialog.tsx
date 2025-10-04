
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
import { Loader2, MessageSquareQuote, Send, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, runTransaction, doc } from 'firebase/firestore';
import type { ChatMessage, Contract, UserProfile, AuditorProfile } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';

type AuditorChatDialogProps = {
  contract: Contract;
  auditorProfile: AuditorProfile | null;
  clientProfile: UserProfile | null;
};

export function AuditorChatDialog({ contract, auditorProfile, clientProfile }: AuditorChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !contract.userId || !contract.id) return null;
    const chatPath = `users/${contract.userId}/contracts/${contract.id}/chats`;
    return query(collection(firestore, chatPath), orderBy('timestamp', 'asc'));
  }, [firestore, user, contract.id, contract.userId]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);
  
  const partnerProfile = user?.uid === contract.userId ? auditorProfile : clientProfile;
  const currentUserProfile = user?.uid === contract.userId ? clientProfile : auditorProfile;

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
    if (!input.trim() || !user) return;

    setIsLoading(true);

    const chatPath = `users/${contract.userId}/contracts/${contract.id}/chats`;
    const chatColRef = collection(firestore, chatPath);

    const userRef = doc(firestore, 'users', user.uid);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists() || userDoc.data()?.creditBalance < 1) {
                throw new Error("Insufficient credits. Each message costs 1 credit.");
            }

            const newBalance = userDoc.data().creditBalance - 1;
            transaction.update(userRef, { creditBalance: newBalance });
            
            await addDoc(chatColRef, {
                senderId: user.uid,
                text: input,
                timestamp: serverTimestamp(),
            });
        });
        
        setInput('');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: error.message || 'Could not send message.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAvatarFallback = (profile: UserProfile | AuditorProfile | null) => {
    return profile?.displayName?.charAt(0) || (profile as UserProfile)?.email?.charAt(0) || '?';
  }
  
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.senderId === user?.uid;
    const senderProfile = isUser ? currentUserProfile : partnerProfile;

    return (
      <div
        key={message.id}
        className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
      >
        <Avatar className={cn("w-8 h-8 border", isUser ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground')}>
          <AvatarFallback>{getAvatarFallback(senderProfile)}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'p-3 rounded-lg text-sm max-w-[85%]',
            isUser ? 'bg-accent text-accent-foreground' : 'bg-muted'
          )}
        >
          <p>{message.text}</p>
          <p className={cn("text-xs mt-1", isUser ? "text-accent-foreground/70" : "text-muted-foreground/70")}>
            {message.timestamp ? format(message.timestamp.toDate(), 'p', { locale: enIN }) : 'sending...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="mt-4">
            <MessageSquareQuote className="mr-2 h-4 w-4" /> Chat with Auditor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat with {partnerProfile?.displayName || 'Auditor'}</DialogTitle>
          <DialogDescription>
            Discuss the contract: {contract.title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin"/></div>
            ) : messages && messages.length > 0 ? (
                messages.map(renderMessage)
            ) : (
                <div className="text-center text-muted-foreground p-8">No messages yet. Start the conversation!</div>
            )}
             {isLoading && input && (
              <div className="flex items-start gap-3 flex-row-reverse">
                <Avatar className="w-8 h-8 border bg-accent text-accent-foreground">
                    <AvatarFallback>{getAvatarFallback(currentUserProfile)}</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-accent text-accent-foreground text-sm opacity-50">
                    <p>{input}</p>
                    <p className="text-xs mt-1 text-accent-foreground/70">sending...</p>
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
              placeholder="Type your message... (1 credit)"
              disabled={isLoading || isUserLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || isUserLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
