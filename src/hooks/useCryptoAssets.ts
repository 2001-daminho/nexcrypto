
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CryptoAsset {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  amount: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  price?: number;
  value?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell' | 'receive' | 'send';
  symbol: string;
  amount: number;
  price_usd?: number | null;
  status: 'pending' | 'completed' | 'failed';
  recipient_address?: string | null;
  transaction_hash?: string | null;
  created_at: string;
}

export function useCryptoAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get mock prices (in a real app, you'd use a pricing API)
  const getCryptoPrice = (symbol: string) => {
    const prices: {[key: string]: number} = {
      btc: 82958.00,
      eth: 1943.00,
      sol: 126.20,
      usdt: 0.99,
      ltc: 91.75,
      ada: 0.58,
      doge: 0.12,
      // Add other crypto prices as needed
    };
    return prices[symbol.toLowerCase()] || 0;
  };

  const fetchAssets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Add price and value to each asset
      const assetsWithValue = (data || []).map(asset => ({
        ...asset,
        // Convert amount from string to number if needed
        amount: typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount,
        price: getCryptoPrice(asset.symbol),
        value: (typeof asset.amount === 'string' ? parseFloat(asset.amount) : asset.amount) * getCryptoPrice(asset.symbol)
      }));
      
      setAssets(assetsWithValue);
      
      // Calculate total balance
      const total = assetsWithValue.reduce((sum, asset) => sum + (asset.value || 0), 0);
      setTotalBalance(total);
      
    } catch (err: any) {
      console.error('Error fetching assets:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Ensure transaction types match our interface
      const typedTransactions = (data || []).map(tx => ({
        ...tx,
        // Convert amount from string to number if needed
        amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
        // Ensure type is one of the allowed types
        type: (tx.type as 'buy' | 'sell' | 'receive' | 'send'),
        // Ensure status is one of the allowed statuses
        status: (tx.status as 'pending' | 'completed' | 'failed')
      })) as Transaction[];
      
      setTransactions(typedTransactions);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err);
    }
  };

  // Execute a buy/sell transaction
  const executeTransaction = async (
    type: 'buy' | 'sell', 
    symbol: string, 
    amount: number
  ) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const price = getCryptoPrice(symbol);
      
      // 1. Record the transaction
      const { error: txError, data: newTx } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type,
          symbol,
          amount,
          price_usd: price,
          status: 'completed'
        })
        .select()
        .single();
        
      if (txError) throw txError;
      
      // 2. Update or create the asset
      const { data: existingAsset } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();
        
      const assetAmount = type === 'buy' ? amount : -amount;
      
      if (existingAsset) {
        // Make sure we don't go negative on sells
        const currentAmount = typeof existingAsset.amount === 'string' 
          ? parseFloat(existingAsset.amount) 
          : existingAsset.amount;
          
        if (type === 'sell' && currentAmount < amount) {
          throw new Error('Insufficient balance');
        }
        
        // Update existing asset
        const { error: updateError } = await supabase
          .from('crypto_assets')
          .update({ 
            amount: currentAmount + assetAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAsset.id);
          
        if (updateError) throw updateError;
      } else {
        if (type === 'sell') {
          throw new Error('No asset to sell');
        }
        
        // Create new asset record
        const { error: insertError } = await supabase
          .from('crypto_assets')
          .insert({
            user_id: user.id,
            symbol,
            name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
            amount: assetAmount,
            image_url: `https://cryptologos.cc/logos/${symbol}-${symbol}-logo.png`
          });
          
        if (insertError) throw insertError;
      }
      
      // Refresh data
      await Promise.all([fetchAssets(), fetchTransactions()]);
      
      return newTx;
      
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  // Initial data load
  useEffect(() => {
    if (user) {
      Promise.all([fetchAssets(), fetchTransactions()]);
    }
  }, [user]);

  return {
    assets,
    transactions,
    totalBalance,
    loading,
    error,
    fetchAssets,
    fetchTransactions,
    executeTransaction,
    getCryptoPrice,
  };
}
