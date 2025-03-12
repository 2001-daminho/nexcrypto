
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, Copy, ChevronLeft, Send, Download, Loader, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCryptoAssets, AssetType, Transaction } from '@/hooks/useCryptoAssets';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'detail' | 'receive' | 'send'>('overview');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [gasFee, setGasFee] = useState(0.001);
  const navigate = useNavigate();
  
  const { 
    assets, 
    transactions, 
    loading, 
    totalBalance, 
    todayIncome, 
    todayExpense, 
    sendTransaction 
  } = useCryptoAssets();

  if (!user) {
    // Redirect to auth page if not logged in
    navigate('/auth');
    return null;
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "address copied",
      description: "wallet address has been copied to clipboard",
    });
  };

  const handleCopyUserId = () => {
    const walletId = user?.id.substring(0, 10) || "3535688863";
    navigator.clipboard.writeText(walletId);
    toast({
      title: "user id copied",
      description: "user id has been copied to clipboard",
    });
  };

  const handleViewCrypto = (crypto: AssetType) => {
    setSelectedCrypto(crypto.symbol);
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

  const handleReceiveCrypto = (crypto: AssetType) => {
    setSelectedCrypto(crypto.symbol);
    setSelectedView('receive');
  };

  const handleSendCrypto = (crypto: AssetType) => {
    setSelectedCrypto(crypto.symbol);
    setSelectedView('send');
  };

  const handleSendTransaction = async () => {
    if (!sendAmount || !recipientAddress || !selectedCrypto) {
      toast({
        title: "error",
        description: "please enter amount and recipient address",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const success = await sendTransaction(
        selectedCrypto,
        amount,
        recipientAddress,
        gasFee
      );
      
      if (success) {
        toast({
          title: "Transaction sent",
          description: `${sendAmount} ${selectedCrypto} sent to ${recipientAddress.substring(0, 10)}...`,
        });
        
        // Return to overview
        setSelectedView('overview');
        setSelectedCrypto(null);
        setSendAmount('');
        setRecipientAddress('');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Mock address for demo purposes
  const getWalletAddress = (crypto: string) => {
    return `${crypto.toLowerCase()}1${user?.id.substring(0, 24)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const walletId = user?.id.substring(0, 10) || "3535688863";

  // Overview - Main Dashboard
  if (selectedView === 'overview') {
    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <div className="mb-8">
          <Card className="bg-[#1A1F2C] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">total balance</CardTitle>
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
                  <div className="text-4xl font-bold">${totalBalance.toFixed(2)}</div>
                </div>
                <div className="flex gap-10 mt-4 md:mt-0">
                  <div>
                    <div className="text-lg font-medium">today's income</div>
                    <div className="flex items-center">
                      <ArrowDown className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xl font-bold">${todayIncome.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">today's expense</div>
                    <div className="flex items-center">
                      <ArrowUp className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xl font-bold">${todayExpense.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-4">your assets</h2>
        <div className="space-y-4">
          {assets.map((crypto) => (
            <Card key={crypto.id} className="hover:border-crypto-light-blue/20 transition-all cursor-pointer" onClick={() => handleViewCrypto(crypto)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img src={crypto.image_url || ''} alt={crypto.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-bold">${crypto.price.toLocaleString()}</div>
                      <div className="text-sm text-white/70">{crypto.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium">{crypto.amount} {crypto.symbol}</div>
                    <div className="text-sm text-gray-400">${crypto.value.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {transactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">recent transactions</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium capitalize">{tx.type} {tx.symbol}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${tx.type === 'buy' || tx.type === 'receive' ? 'text-crypto-success-green' : 'text-crypto-error-red'}`}>
                          {tx.type === 'buy' || tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                        </div>
                        {tx.price_usd && (
                          <div className="text-sm text-gray-500">
                            ${(tx.amount * tx.price_usd).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Crypto Detail View
  if (selectedView === 'detail' && selectedCrypto) {
    const crypto = assets.find(c => c.symbol === selectedCrypto);
    if (!crypto) return null;

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="text-right text-crypto-error-red font-medium mb-4 w-full">
            {/* We'll replace this with real price change data when available */}
            0.00%
          </div>
          <img src={crypto.image_url || ''} alt={crypto.name} className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-bold mb-1">${crypto.value.toFixed(2)}</h1>
          <p className="text-gray-500">{crypto.amount} ({crypto.symbol})</p>
          
          <div className="flex gap-2 mt-6">
            <Button size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600" onClick={() => handleSendCrypto(crypto)}>
              <Send className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-600" onClick={() => handleReceiveCrypto(crypto)}>
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">transactions</h2>
        <Card>
          <CardContent className="p-4">
            {transactions.filter(tx => tx.symbol === selectedCrypto).length > 0 ? (
              <div className="space-y-4">
                {transactions
                  .filter(tx => tx.symbol === selectedCrypto)
                  .map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${tx.type === 'buy' || tx.type === 'receive' ? 'text-crypto-success-green' : 'text-crypto-error-red'}`}>
                          {tx.type === 'buy' || tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                        </div>
                        {tx.price_usd && (
                          <div className="text-sm text-gray-500">
                            ${(tx.amount * tx.price_usd).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">no transactions found!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Receive Crypto View
  if (selectedView === 'receive' && selectedCrypto) {
    const crypto = assets.find(c => c.symbol === selectedCrypto);
    if (!crypto) return null;
    
    const address = getWalletAddress(crypto.symbol);

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image_url || ''} alt={crypto.name} className="w-20 h-20 mb-4" />
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
    const crypto = assets.find(c => c.symbol === selectedCrypto);
    if (!crypto) return null;

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image_url || ''} alt={crypto.name} className="w-20 h-20 mb-4" />
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
                  available: {crypto.amount} {crypto.symbol}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="gasFee" className="text-sm font-medium">gas fee (ETH)</label>
                <div className="flex border rounded-md overflow-hidden">
                  <Input
                    id="gasFee"
                    placeholder="0.001"
                    value={gasFee.toString()}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setGasFee(value);
                      }
                    }}
                    className="border-0 flex-1"
                  />
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 uppercase">
                    ETH
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  required for transaction processing
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
