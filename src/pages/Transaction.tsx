
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

const Transaction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAssets, setUserAssets] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  // Fetch user assets and transactions
  useEffect(() => {
    if (user) {
      fetchUserAssets();
      fetchRecentTransactions();
    }
  }, [user]);
  
  const fetchUserAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setUserAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };
  
  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  const handleTransaction = async () => {
    if (!amount || !crypto) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Insert the transaction
      const numericAmount = parseFloat(amount);
      const pricePerUnit = 100; // In a real app, get real-time price
      
      const { error: transactionError, data: newTransaction } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          type: transactionType,
          symbol: crypto,
          amount: numericAmount,
          price_usd: pricePerUnit,
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // 2. Update the user's balance
      // First check if they already have this asset
      const { data: existingAsset } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', user!.id)
        .eq('symbol', crypto)
        .single();
      
      const assetAmount = transactionType === 'buy' ? numericAmount : -numericAmount;
      
      if (existingAsset) {
        // Update existing asset
        const { error: updateError } = await supabase
          .from('crypto_assets')
          .update({ 
            amount: existingAsset.amount + assetAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAsset.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new asset record
        const { error: insertError } = await supabase
          .from('crypto_assets')
          .insert({
            user_id: user!.id,
            symbol: crypto,
            name: crypto.charAt(0).toUpperCase() + crypto.slice(1),
            amount: assetAmount,
            image_url: `https://cryptologos.cc/logos/${crypto}-${crypto}-logo.png`
          });
          
        if (insertError) throw insertError;
      }
      
      // Success message
      toast({
        title: "Transaction successful",
        description: `Your ${transactionType} order for ${amount} ${crypto} has been processed.`,
      });
      
      // Refresh data
      fetchUserAssets();
      fetchRecentTransactions();
      
      // Clear form
      setAmount('');
      setCrypto('');
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction failed",
        description: error.message || "An error occurred while processing your transaction.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to make transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button variant="default" onClick={() => navigate('/auth')}>
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-xl">
      <h1 className="text-4xl font-bold mb-8">Transaction</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Transaction</CardTitle>
          <CardDescription>Buy or sell crypto assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup 
              defaultValue={transactionType} 
              onValueChange={setTransactionType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="buy" />
                <Label htmlFor="buy" className="cursor-pointer">Buy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="sell" />
                <Label htmlFor="sell" className="cursor-pointer">Sell</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <Select value={crypto} onValueChange={setCrypto}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                <SelectItem value="solana">Solana (SOL)</SelectItem>
                <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                <SelectItem value="dogecoin">Dogecoin (DOGE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => setAmount(transactionType === 'buy' ? '100' : '0.01')}
                className="whitespace-nowrap"
              >
                Max
              </Button>
            </div>
          </div>
          
          <div className="rounded-md bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span>Estimated value:</span>
              <span>{amount ? `$${(parseFloat(amount) * 100).toFixed(2)}` : '$0.00'}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Fee:</span>
              <span>$0.00</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleTransaction}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {transactionType === 'buy' ? 'Buy' : 'Sell'} {crypto && crypto.charAt(0).toUpperCase() + crypto.slice(1)}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
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
            ) : (
              <p className="text-center text-sm text-gray-500 py-6">
                No recent transactions
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transaction;
