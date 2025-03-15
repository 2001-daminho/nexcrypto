
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (phrase: string) => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

  useEffect(() => {
    if (!isOpen) {
      // Reset the state when modal closes
      setSeedPhrase('');
      setStatus('idle');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedPhrase.trim()) return;
    
    setStatus('connecting');
    
    // Simulate connecting to wallet
    setTimeout(() => {
      onConnect(seedPhrase);
      setStatus('connected');
      
      // Close the modal after showing "connected" for a moment
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 10000); // 10 seconds delay as requested
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1A1F2C] text-white border-0 sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold">connect external wallet</DialogTitle>
          <DialogDescription className="text-gray-400">
            enter your seed phrase to connect your wallet
          </DialogDescription>
        </DialogHeader>
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm text-white hover:bg-white/10 p-1"
          disabled={status !== 'idle'}
        >
          <X className="h-4 w-4" />
        </button>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4">
            <Input
              placeholder="Enter seed phrase here..."
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              className="bg-transparent border-[#3B4254] border-2 h-12 text-white"
              disabled={status !== 'idle'}
            />
            
            {status === 'idle' ? (
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!seedPhrase.trim()}
              >
                Connect Wallet
              </Button>
            ) : status === 'connecting' ? (
              <div className="flex items-center justify-center p-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="ml-2">Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-green-400 p-2">
                <span>Connected Successfully!</span>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
