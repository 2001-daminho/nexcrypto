
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BalanceCardProps {
  totalBalance: number;
  todayIncome: number;
  todayExpense: number;
  walletId: string;
  onCopyUserId: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  todayIncome,
  todayExpense,
  walletId,
  onCopyUserId
}) => {
  return (
    <Card className="bg-[#1A1F2C] text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">total balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="text-sm text-gray-400 mb-1">
              wallet id {walletId} 
              <Copy 
                className="inline h-3 w-3 cursor-pointer ml-1" 
                onClick={onCopyUserId} 
              />
            </div>
            <div className="text-4xl font-bold">${totalBalance.toFixed(2)}</div>
          </div>
          <div className="flex gap-10 mt-4 md:mt-0">
            <div>
              <div className="text-lg font-medium">today's income</div>
              <div className="flex items-center">
                <ArrowDown className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xl font-bold">${todayIncome.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="text-lg font-medium">today's expense</div>
              <div className="flex items-center">
                <ArrowUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xl font-bold">${todayExpense.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
