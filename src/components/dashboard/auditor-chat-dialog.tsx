
'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquareQuote, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, runTransaction, doc, writeBatch, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { ChatMessage, Contract, UserProfile } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';

type AuditorChatDialogProps = {
  contract: Contract;
  clientProfile: UserProfile | null;
  auditorProfiles: UserProfile[];
};

export function AuditorChatDialog({ contract, clientProfile, auditorProfiles }: AuditorChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const CHAT_COST = 3;
  const AUDITOR_REWARD = 1;

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !contract.id || !contract.userId) return null;
    const chatPath = `users/${contract.userId}/contracts/${contract.id}/chats`;
    return query(collection(firestore, chatPath), orderBy('timestamp', 'asc'));
  }, [firestore, user, contract.id, contract.userId]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);
  
  const isClient = user?.uid === contract.userId;
  const currentUserProfile = isClient ? clientProfile : auditorProfiles.find(p => p.id === user?.uid);

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
    if (!input.trim() || !user || !contract.userId || !contract.id || !currentUserProfile) return;

    setIsLoading(true);

    try {
        await runTransaction(firestore, async (transaction) => {
            const chatPath = `users/${contract.userId}/contracts/${contract.id}/chats`;
            const newMessageRef = doc(collection(firestore, chatPath));

            // If the current user is the client, handle the credit transaction
            if (isClient) {
                const clientRef = doc(firestore, 'users', user.uid);
                
                // --- ALL READS FIRST ---
                const clientDoc = await transaction.get(clientRef);
                if (!clientDoc.exists()) {
                    throw new Error("Client profile not found.");
                }

                const clientBalance = clientDoc.data()?.creditBalance || 0;
                if (clientBalance < CHAT_COST) {
                    throw new Error(`Insufficient credits. Each message costs ${CHAT_COST} credits.`);
                }

                const auditorRefs = (contract.auditorIds || []).map(id => doc(firestore, 'users', id));
                const auditorDocs = await Promise.all(auditorRefs.map(ref => transaction.get(ref)));

                // --- ALL WRITES LAST ---
                
                // 1. Deduct cost from client
                const newClientBalance = clientBalance - CHAT_COST;
                transaction.update(clientRef, { creditBalance: newClientBalance });

                // 2. Distribute reward to auditors
                auditorDocs.forEach((auditorDoc) => {
                  if (auditorDoc.exists()) {
                    const auditorBalance = auditorDoc.data()?.creditBalance || 0;
                    const newAuditorBalance = auditorBalance + AUDITOR_REWARD;
                    transaction.update(auditorDoc.ref, { creditBalance: newAuditorBalance });
                  }
                });
            }
            
            // 3. Add the new message (This is a write operation)
            // This happens for both client and auditor messages.
            transaction.set(newMessageRef, {
                senderId: user.uid,
                senderName: currentUserProfile.displayName || currentUserProfile.email,
                senderAvatarUrl: currentUserProfile.avatarUrl,
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
  
  const renderMessage = (message: ChatMessage) => {
    const isCurrentUser = message.senderId === user?.uid;

    return (
      <div
        key={message.id}
        className={cn('flex items-start gap-3', isCurrentUser && 'flex-row-reverse')}
      >
        <Avatar className={cn("w-8 h-8 border", isCurrentUser ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground')}>
          <AvatarImage src={message.senderAvatarUrl} alt={message.senderName}/>
          <AvatarFallback>{message.senderName?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'p-3 rounded-lg text-sm max-w-[85%]',
            isCurrentUser ? 'bg-accent text-accent-foreground' : 'bg-muted'
          )}
        >
          {!isCurrentUser && <p className="font-semibold text-xs mb-1">{message.senderName}</p>}
          <p>{message.text}</p>
          <p className={cn("text-xs mt-1", isCurrentUser ? "text-accent-foreground/70" : "text-muted-foreground/70")}>
            {message.timestamp ? format(message.timestamp.toDate(), 'p', { locale: enIN }) : 'sending...'}
          </p>
        </div>
      </div>
    );
  }
  
  const inputPlaceholder = isClient ? `Type your message... (${CHAT_COST} credits)` : 'Type your message...';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="mt-4 w-full">
            <MessageSquareQuote className="mr-2 h-4 w-4" /> Chat with Review Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Contract War Room</DialogTitle>
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
             {isLoading && input && currentUserProfile && (
              <div className="flex items-start gap-3 flex-row-reverse">
                <Avatar className="w-8 h-8 border bg-accent text-accent-foreground">
                    <AvatarImage src={currentUserProfile.avatarUrl} alt={currentUserProfile.displayName} />
                    <AvatarFallback>{currentUserProfile.displayName?.charAt(0) || '?'}</AvatarFallback>
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
              placeholder={inputPlaceholder}
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
