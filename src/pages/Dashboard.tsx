
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Download, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCryptoAssets } from '@/hooks/useCryptoAssets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our new components
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { AssetCard } from '@/components/dashboard/AssetCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { QRCodeDisplay } from '@/components/dashboard/QRCodeDisplay';

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'detail' | 'receive' | 'send'>('overview');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');
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

  const handleViewCrypto = (crypto: any) => {
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

  const handleReceiveCrypto = (crypto: any) => {
    setSelectedCrypto(crypto.symbol);
    setSelectedView('receive');
  };

  const handleSendCrypto = (crypto: any) => {
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
        recipientAddress
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
          <BalanceCard 
            totalBalance={totalBalance}
            todayIncome={todayIncome}
            todayExpense={todayExpense}
            walletId={walletId}
            onCopyUserId={handleCopyUserId}
          />
        </div>

        <Tabs defaultValue="assets" className="w-full" onValueChange={(value) => setActiveTab(value as 'assets' | 'transactions')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assets" className="mt-0">
            <div className="space-y-4">
              {assets.map((crypto) => (
                <AssetCard 
                  key={crypto.id} 
                  crypto={crypto} 
                  onClick={() => handleViewCrypto(crypto)} 
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-0">
            {transactions.length > 0 ? (
              <TransactionList transactions={transactions} />
            ) : (
              <div className="text-center py-10 bg-gray-800/20 rounded-lg">
                <p className="text-gray-400">You don't have any transactions yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600" 
              onClick={() => handleSendCrypto(crypto)}
            >
              <Send className="h-5 w-5 mr-2" />
              Send
            </Button>
            <Button 
              className="rounded-full bg-green-500 hover:bg-green-600" 
              onClick={() => handleReceiveCrypto(crypto)}
            >
              <Download className="h-5 w-5 mr-2" />
              Receive
            </Button>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">transactions</h2>
        <TransactionList 
          transactions={transactions} 
          filteredSymbol={selectedCrypto} 
        />
      </div>
    );
  }

  // Receive Crypto View
  if (selectedView === 'receive' && selectedCrypto) {
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
          
          <QRCodeDisplay
            cryptoSymbol={crypto.symbol}
            cryptoName={crypto.name}
            onCopyAddress={handleCopyAddress}
            imageUrl={crypto.image_url || ''}
          />
        </div>
      </div>
    );
  }

  // Send Crypto View
  if (selectedView === 'send' && selectedCrypto) {
    const crypto = assets.find(c => c.symbol === selectedCrypto);
    if (!crypto) return null;

<<<<<<< HEAD
    // Calculate gas fee as 10% of the amount in the same currency
    const amount = parseFloat(sendAmount) || 0;
    const gasFeeAmount = amount * 0.1; // 10% of the transaction amount
=======
    // Calculate USD value
    const amount = parseFloat(sendAmount) || 0;
    const usdValue = amount * crypto.price;
    
    // Calculate gas fee as 10% of the amount in the same currency
    const gasFeeAmount = amount * 0.10;
    const gasFeeUsdValue = gasFeeAmount * crypto.price;
    
    // Check if minimum withdrawal is met
    const isMinimumMet = usdValue >= 1000;
>>>>>>> fec64bf48f0877c6284823270ecf5947142417c3

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image_url || ''} alt={crypto.name} className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold mb-6">{crypto.symbol}</h2>
          
          <div className="w-full max-w-2xl bg-gray-800/20 p-6 rounded-lg">
            <div className="space-y-6">
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
                  <div className="p-3 uppercase">
                    {crypto.symbol}
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">
                    available: {crypto.amount} {crypto.symbol}
                  </p>
                  <p className={`text-xs ${isMinimumMet ? 'text-green-500' : 'text-red-500'}`}>
                    USD value: ${usdValue.toFixed(2)} {!isMinimumMet && '(minimum $1,000)'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="gasFee" className="text-sm font-medium">gas fee ({crypto.symbol})</label>
                <div className="flex border rounded-md overflow-hidden">
                  <Input
                    id="gasFee"
                    value={gasFeeAmount.toFixed(6)}
                    readOnly
                    className="border-0 flex-1"
                  />
                  <div className="p-3 uppercase">
                    {crypto.symbol}
                  </div>
                </div>
<<<<<<< HEAD
                <p className="text-xs text-gray-500">
                  10% transaction fee for processing
                </p>
=======
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">
                    10% transaction fee
                  </p>
                  <p className="text-xs text-gray-500">
                    USD value: ${gasFeeUsdValue.toFixed(2)}
                  </p>
                </div>
>>>>>>> fec64bf48f0877c6284823270ecf5947142417c3
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSendTransaction}
                disabled={isSending || !isMinimumMet}
              >
                {isSending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    sending...
                  </>
                ) : (
                  isMinimumMet ? "send" : "minimum withdrawal $1,000"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
