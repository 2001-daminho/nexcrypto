import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchTopCryptos } from '@/services/cryptoService';

export type TransactionType = 'receive' | 'send' | 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  type: TransactionType;
  recipient_address?: string;
  transaction_hash?: string;
  status: TransactionStatus;
  price_usd?: number;
  created_at: string;
  gas_fee?: number;
}

export interface AssetType {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  amount: number;
  image_url?: string;
  price: number;
  value: number;
  created_at: string;
  updated_at: string;
}

export const useCryptoAssets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

  // Fetch real-time market prices
  const fetchMarketPrices = async () => {
    try {
      const cryptoData = await fetchTopCryptos(1, 100);
      const prices: Record<string, number> = {};
      
      cryptoData.forEach((crypto: any) => {
        prices[crypto.symbol.toLowerCase()] = crypto.current_price;
      });
      
      // Make sure we have prices for our assets (add fallbacks)
      const fallbackPrices = {
        'btc': 61324.36,
        'eth': 3213.25,
        'sol': 156.78,
        'usdt': 1.00,
        'usdc': 1.00
      };
      
      // Merge real-time prices with fallbacks
      setMarketPrices({
        ...fallbackPrices,
        ...prices
      });
      
    } catch (error) {
      console.error('Error fetching market prices:', error);
    }
  };

  const fetchAssets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert any LTC to USDC if found
      const updatedData = data.map(asset => {
        if (asset.symbol.toLowerCase() === 'ltc') {
          return {
            ...asset,
            symbol: 'usdc',
            name: 'USD Coin'
          };
        }
        return asset;
      });

      const assetsWithPrice = updatedData.map(asset => {
        const symbol = asset.symbol.toLowerCase();
        const price = marketPrices[symbol] || 0;
        const value = Number(asset.amount) * price;
        return {
          ...asset,
          price,
          value,
          amount: Number(asset.amount)
        };
      });

      setAssets(assetsWithPrice);

      // Calculate total balance
      const total = assetsWithPrice.reduce((sum, asset) => sum + asset.value, 0);
      setTotalBalance(total);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error fetching assets",
        description: "There was a problem loading your assets.",
        variant: "destructive"
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to proper types
      const typedTransactions = data.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        price_usd: tx.price_usd ? Number(tx.price_usd) : undefined,
        gas_fee: tx.gas_fee ? Number(tx.gas_fee) : undefined,
        // Ensure type is within allowed values
        type: validateTransactionType(tx.type),
        // Ensure status is within allowed values
        status: validateTransactionStatus(tx.status),
      }));
      
      setTransactions(typedTransactions);

      // Calculate today's income & expense
      const today = new Date().toISOString().split('T')[0];
      
      const todayTx = typedTransactions.filter(tx => 
        tx.created_at.startsWith(today)
      );
      
      const income = todayTx
        .filter(tx => tx.type === 'receive' || tx.type === 'buy')
        .reduce((sum, tx) => sum + (tx.price_usd ? tx.amount * tx.price_usd : 0), 0);
      
      const expense = todayTx
        .filter(tx => tx.type === 'send' || tx.type === 'sell')
        .reduce((sum, tx) => sum + (tx.price_usd ? tx.amount * tx.price_usd : 0), 0);
      
      setTodayIncome(income);
      setTodayExpense(expense);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Helper function to validate transaction type
  const validateTransactionType = (type: string): TransactionType => {
    const validTypes: TransactionType[] = ['receive', 'send', 'buy', 'sell'];
    return validTypes.includes(type as TransactionType) 
      ? (type as TransactionType) 
      : 'receive';
  };

  // Helper function to validate transaction status
  const validateTransactionStatus = (status: string): TransactionStatus => {
    const validStatuses: TransactionStatus[] = ['pending', 'completed', 'failed'];
    return validStatuses.includes(status as TransactionStatus) 
      ? (status as TransactionStatus) 
      : 'completed';
  };

  // Send a transaction with 10% gas fee based on USD value
  const sendTransaction = async (
    symbol: string,
    amount: number,
    recipientAddress: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    // Get the USD value of the transaction
    const symbolPrice = marketPrices[symbol.toLowerCase()] || 0;
    const transactionValueUSD = amount * symbolPrice;
    
    // Check if the USD value is at least $1,000
    if (transactionValueUSD < 1000) {
      toast({
        title: "Minimum withdrawal required",
        description: `Minimum withdrawal amount is $1,000. Your transaction is only worth $${transactionValueUSD.toFixed(2)}.`,
        variant: "destructive"
      });
      return false;
    }
    
    // Calculate gas fee as 10% of the transaction USD value, converted to the same crypto
    const gasFee = (amount * 0.10); // 10% of the amount in the same currency
    
    // Check if the user has enough of the asset to send
    const asset = assets.find(a => a.symbol.toLowerCase() === symbol.toLowerCase());
    if (!asset || asset.amount < (amount + gasFee)) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${symbol} to cover the gas fee.`,
        variant: "destructive"
      });
      return false;
    }

    try {
      // Create a transaction hash (simplified for demo)
      const transactionHash = `tx_${Math.random().toString(36).substring(2, 15)}`;
      
      // 1. Record the transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          symbol: symbol.toUpperCase(),
          amount,
          type: 'send',
          recipient_address: recipientAddress,
          transaction_hash: transactionHash,
          status: 'completed',
          price_usd: marketPrices[symbol.toLowerCase()],
          gas_fee: gasFee
        });
      
      if (txError) throw txError;
      
      // 2. Update the asset balance (deducting both amount and gas fee)
      const { error: assetError } = await supabase
        .from('crypto_assets')
        .update({ amount: (asset.amount - amount - gasFee) })
        .eq('id', asset.id);
      
      if (assetError) throw assetError;
      
      // 3. Record gas fee as a separate transaction
      const { error: gasTxError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          symbol: symbol.toUpperCase(),
          amount: gasFee,
          type: 'send',
          recipient_address: 'GAS_FEE',
          transaction_hash: `${transactionHash}_gas`,
          status: 'completed',
          price_usd: marketPrices[symbol.toLowerCase()]
        });
      
      if (gasTxError) throw gasTxError;
      
      // Show success message
      toast({
        title: "Transaction successful",
        description: `You've sent ${amount} ${symbol} with a gas fee of ${gasFee.toFixed(6)} ${symbol}.`,
      });
      
      // Refresh data
      await fetchAssets();
      await fetchTransactions();
      
      return true;
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "Transaction failed",
        description: "There was a problem processing your transaction.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    // Fetch market prices first
    fetchMarketPrices();
    
    // Set up interval to refresh market prices every minute
    const marketPriceInterval = setInterval(fetchMarketPrices, 60000);
    
    return () => {
      clearInterval(marketPriceInterval);
    };
  }, []);

  useEffect(() => {
    if (user && Object.keys(marketPrices).length > 0) {
      setLoading(true);
      Promise.all([fetchAssets(), fetchTransactions()])
        .finally(() => setLoading(false));
    }
  }, [user, marketPrices]);

  // Subscribe to real-time updates when component mounts
  useEffect(() => {
    if (!user) return;

    // Subscribe to assets changes
    const assetsSubscription = supabase
      .channel('crypto_assets_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crypto_assets', filter: `user_id=eq.${user.id}` },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    // Subscribe to transactions changes
    const transactionsSubscription = supabase
      .channel('transactions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      assetsSubscription.unsubscribe();
      transactionsSubscription.unsubscribe();
    };
  }, [user]);

  return {
    assets,
    transactions,
    loading,
    totalBalance,
    todayIncome,
    todayExpense,
    sendTransaction,
    refreshData: () => {
      fetchMarketPrices();
      fetchAssets();
      fetchTransactions();
    }
  };
};
