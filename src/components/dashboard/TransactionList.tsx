
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from '@/hooks/useCryptoAssets';

interface TransactionListProps {
  transactions: Transaction[];
  filteredSymbol?: string | null;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  filteredSymbol 
}) => {
  const filteredTransactions = filteredSymbol 
    ? transactions.filter(tx => tx.symbol === filteredSymbol)
    : transactions;

  return (
    <Card>
      <CardContent className="p-4">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.slice(0, 10).map((tx) => (
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
          <div className="text-center py-10">
            <p className="text-gray-500">no transactions found!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
