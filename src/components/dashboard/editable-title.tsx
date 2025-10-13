
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Edit, Loader2 } from 'lucide-react';
import type { Contract } from '@/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type EditableTitleProps = {
  contract: Contract;
};

export function EditableTitle({ contract }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(contract.title);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!user || title.trim() === '' || title.trim() === contract.title) {
      setIsEditing(false);
      setTitle(contract.title); // Reset if invalid or unchanged
      return;
    }

    setIsLoading(true);
    const contractRef = doc(firestore, 'users', user.uid, 'contracts', contract.id);

    try {
      await updateDoc(contractRef, { title: title.trim() });
      toast({
        title: 'Title Updated',
        description: 'The contract title has been successfully changed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating the title.',
      });
      setTitle(contract.title); // Revert on error
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTitle(contract.title);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="h-9"
        />
        <Button size="icon" className="h-9 w-9" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Check />}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-2 cursor-pointer"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {if(e.key === 'Enter') setIsEditing(true)}}
    >
      <div className="font-medium group-hover:text-primary">{title}</div>
      <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
