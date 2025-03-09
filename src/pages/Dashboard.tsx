
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Copy, ChevronLeft, Send, Download, ShoppingCart, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTopCryptos } from '@/hooks/useCryptoData';

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
  const [selectedView, setSelectedView] = useState<'overview' | 'detail' | 'receive'>('overview');
  const { data: topCryptos } = useTopCryptos(1, 10);

  const walletId = "3535688863";
  const mockCryptos = [
    { 
      id: "bitcoin", 
      name: "Bitcoin", 
      symbol: "BTC", 
      price: 82958.00, 
      change: -3.87, 
      amount: 0.000, 
      image: "/public/lovable-uploads/01150980-0893-4541-8b64-e53e07fba6b0.png"
    },
    { 
      id: "ethereum", 
      name: "Ethereum", 
      symbol: "ETH", 
      price: 2046.17, 
      change: -7.72, 
      amount: 0.000,
      image: "/public/lovable-uploads/af63c996-8aee-482b-84d2-513207adc3ac.png"
    }
  ];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied",
      description: "Wallet address has been copied to clipboard",
    });
  };

  const handleConnectWallet = () => {
    window.location.href = '/auth?connect=wallet';
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
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button variant="default" onClick={() => window.location.href = '/auth'}>
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview - Main Dashboard
  if (selectedView === 'overview') {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <Card className="bg-[#1A1F2C] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Total Balance</CardTitle>
              <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10" onClick={handleConnectWallet}>
                <Wallet className="mr-2 h-4 w-4" />
                CONNECT WALLET
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="text-sm text-gray-400 mb-1">WALLET ID {walletId} <Copy className="inline h-3 w-3 cursor-pointer" /></div>
                  <div className="text-4xl font-bold">$0.00</div>
                </div>
                <div className="flex gap-10 mt-4 md:mt-0">
                  <div>
                    <div className="text-lg font-medium">Today's Income</div>
                    <div className="flex items-center">
                      <ArrowDown className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xl font-bold">$0.00</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">Today's Expense</div>
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

        <h2 className="text-2xl font-bold mb-4">Latest Activities</h2>
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
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Your Portfolio</CardTitle>
                <CardDescription>View all your crypto assets in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <p className="text-gray-500">No assets found</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/transaction'}>
                    Add Assets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                  <div className="flex justify-between font-medium mb-4">
                    <span>TRANSACTIONS</span>
                    <span>AMOUNT</span>
                  </div>
                  <div className="text-center py-6">
                    <p className="text-gray-500">No Record Found!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets">
            <Card>
              <CardHeader>
                <CardTitle>Connect Wallet</CardTitle>
                <CardDescription>Connect your external wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Button variant="outline" onClick={handleConnectWallet}>
                    Connect External Wallet
                  </Button>
                  <p className="text-xs text-gray-500">
                    Connect your external wallet to manage your assets across different platforms.
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
      <div className="container mx-auto py-10 px-4">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          BACK
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="text-right text-crypto-error-red font-medium mb-4 w-full">
            {crypto.change}%
          </div>
          <img src={crypto.image} alt={crypto.name} className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-bold mb-1">$0.00</h1>
          <p className="text-gray-500">0.0000({crypto.name.toUpperCase()})</p>
          
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
        
        <h2 className="text-2xl font-bold mb-4">Latest Activities</h2>
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-10">
              <p className="text-gray-500">No Record Found!</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mt-4">
              <div className="flex justify-between font-medium">
                <span>TRANSACTIONS</span>
                <span>AMOUNT</span>
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
      <div className="container mx-auto py-10 px-4">
        <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-transparent pl-0">
          <ChevronLeft className="mr-1" />
          BACK
        </Button>

        <div className="flex flex-col items-center justify-center mb-8">
          <img src={crypto.image} alt={crypto.name} className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold mb-6">{crypto.symbol}</h2>
          
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>ADDRESS</CardTitle>
                <CardTitle>{crypto.symbol}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCode value={address} />
              <p className="text-center mt-6 text-gray-500">
                Send only {crypto.symbol} to this deposit address. This address does not support deposit of non-fungible tokens.
              </p>
              
              <div className="flex w-full mt-6 border rounded-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 p-3">
                  {crypto.symbol}
                </div>
                <div className="flex-1 p-3 truncate overflow-hidden">
                  {address}
                </div>
                <Button variant="ghost" className="p-3 border-l" onClick={() => handleCopyAddress(address)}>
                  Copy
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
