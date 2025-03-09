
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Transaction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('');
  
  const handleTransaction = () => {
    if (!amount || !crypto) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate transaction
    toast({
      title: "Transaction submitted",
      description: `Your ${transactionType} order for ${amount} ${crypto} has been simulated.`,
    });
    
    // Clear form
    setAmount('');
    setCrypto('');
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
              <span>$0.00 (Demo)</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleTransaction}>
            {transactionType === 'buy' ? 'Buy' : 'Sell'} {crypto && crypto.charAt(0).toUpperCase() + crypto.slice(1)}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-500 py-6">
              No recent transactions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transaction;
