
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AssetType = {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  amount: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  price: number;
  value: number;
};

export type TransactionType = "receive" | "send" | "buy" | "sell";
export type TransactionStatus = "pending" | "completed" | "failed";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  symbol: string;
  amount: number;
  recipient_address?: string;
  transaction_hash?: string;
  status: TransactionStatus;
  price_usd?: number;
  created_at: string;
  gas_fee?: number;
};

const DEFAULT_CRYPTO_PRICES: Record<string, number> = {
  btc: 82958.00,
  eth: 1943.00,
  sol: 126.20,
  usdt: 0.99,
  ltc: 91.75,
};

// Get crypto logos
const CRYPTO_IMAGES: Record<string, string> = {
  btc: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  eth: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  sol: "https://cryptologos.cc/logos/solana-sol-logo.png",
  usdt: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  ltc: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
};

export const useCryptoAssets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);

  // Fetch assets and transactions
  const fetchAssets = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch assets
      const { data: assetsData, error: assetsError } = await supabase
        .from("crypto_assets")
        .select("*")
        .eq("user_id", user.id);

      if (assetsError) throw assetsError;

      // Add price data and calculate values
      const assetsWithPrices = assetsData?.map(asset => ({
        ...asset,
        amount: Number(asset.amount), // Convert string to number if needed
        price: DEFAULT_CRYPTO_PRICES[asset.symbol.toLowerCase()] || 0,
        value: Number(asset.amount) * (DEFAULT_CRYPTO_PRICES[asset.symbol.toLowerCase()] || 0),
        image_url: asset.image_url || CRYPTO_IMAGES[asset.symbol.toLowerCase()] || null
      })) || [];

      setAssets(assetsWithPrices);

      // Calculate total balance
      const total = assetsWithPrices.reduce((sum, asset) => sum + asset.value, 0);
      setTotalBalance(total);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // Format transaction data
      const formattedTransactions = txData.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        price_usd: tx.price_usd ? Number(tx.price_usd) : undefined,
        gas_fee: tx.gas_fee ? Number(tx.gas_fee) : 0,
        type: tx.type as TransactionType,
        status: tx.status as TransactionStatus
      }));

      setTransactions(formattedTransactions);

      // Calculate today's income and expense
      const today = new Date().toISOString().split('T')[0];
      const todayTxs = formattedTransactions.filter(tx => 
        tx.created_at.startsWith(today)
      );

      const income = todayTxs
        .filter(tx => tx.type === 'receive' || tx.type === 'buy')
        .reduce((sum, tx) => sum + (tx.amount * (tx.price_usd || DEFAULT_CRYPTO_PRICES[tx.symbol.toLowerCase()] || 0)), 0);
      
      const expense = todayTxs
        .filter(tx => tx.type === 'send' || tx.type === 'sell')
        .reduce((sum, tx) => sum + (tx.amount * (tx.price_usd || DEFAULT_CRYPTO_PRICES[tx.symbol.toLowerCase()] || 0)), 0);

      setTodayIncome(income);
      setTodayExpense(expense);

    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your assets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send transaction
  const sendTransaction = async (
    symbol: string, 
    amount: number, 
    recipientAddress: string, 
    gasFee: number = 0.001
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to perform transactions",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if user has this asset
      const asset = assets.find(a => a.symbol.toLowerCase() === symbol.toLowerCase());
      if (!asset) {
        toast({
          title: "Asset not found",
          description: `You don't have any ${symbol}`,
          variant: "destructive",
        });
        return false;
      }

      // Check if user has enough balance
      if (asset.amount < amount) {
        toast({
          title: "Insufficient balance",
          description: `You don't have enough ${symbol} to send`,
          variant: "destructive",
        });
        return false;
      }

      // Check for gas fee
      const ethAsset = assets.find(a => a.symbol.toLowerCase() === 'eth');
      if (!ethAsset || ethAsset.amount < gasFee) {
        toast({
          title: "Insufficient gas fee",
          description: `You need at least ${gasFee} ETH for gas fee`,
          variant: "destructive",
        });
        return false;
      }

      // 1. Record the transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'send',
          symbol: symbol,
          amount: amount,
          recipient_address: recipientAddress,
          price_usd: DEFAULT_CRYPTO_PRICES[symbol.toLowerCase()],
          status: 'completed',
          gas_fee: gasFee
        });
        
      if (txError) throw txError;
      
      // 2. Update the user's balance for the sent asset
      const { error: updateError } = await supabase
        .from('crypto_assets')
        .update({ 
          amount: asset.amount - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);
        
      if (updateError) throw updateError;

      // 3. Update gas fee (deduct from ETH)
      const { error: gasError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'send',
          symbol: 'eth',
          amount: gasFee,
          recipient_address: 'GAS_FEE',
          price_usd: DEFAULT_CRYPTO_PRICES['eth'],
          status: 'completed'
        });

      if (gasError) throw gasError;

      // 4. Update ETH balance
      const { error: ethUpdateError } = await supabase
        .from('crypto_assets')
        .update({ 
          amount: ethAsset.amount - gasFee,
          updated_at: new Date().toISOString()
        })
        .eq('id', ethAsset.id);
        
      if (ethUpdateError) throw ethUpdateError;
      
      // Refresh data
      await fetchAssets();
      
      return true;
    } catch (error) {
      console.error("Send transaction error:", error);
      toast({
        title: "Transaction failed",
        description: "There was an error processing your transaction",
        variant: "destructive",
      });
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchAssets();

      // Set up real-time subscription for assets
      const assetsChannel = supabase
        .channel('table-db-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'crypto_assets', filter: `user_id=eq.${user.id}` },
          () => fetchAssets()
        )
        .subscribe();

      // Set up real-time subscription for transactions
      const transactionsChannel = supabase
        .channel('transactions-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          () => fetchAssets()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(assetsChannel);
        supabase.removeChannel(transactionsChannel);
      };
    }
  }, [user?.id]);

  return {
    assets,
    transactions,
    loading,
    totalBalance,
    todayIncome,
    todayExpense,
    fetchAssets,
    sendTransaction
  };
};
