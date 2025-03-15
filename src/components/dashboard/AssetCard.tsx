
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssetType } from '@/hooks/useCryptoAssets';
import { Bell } from 'lucide-react';

interface AssetCardProps {
  crypto: AssetType;
  onClick: () => void;
  hasRecentTransaction?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ 
  crypto, 
  onClick,
  hasRecentTransaction = false
}) => {
  // Special case for USDC to use the specific logo
  const imageUrl = crypto.symbol.toLowerCase() === 'usdc'
    ? 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    : crypto.image_url || '';

  return (
    <Card 
      className={`hover:border-crypto-light-blue/20 transition-all cursor-pointer ${hasRecentTransaction ? 'border-green-500' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={imageUrl} alt={crypto.name} className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-bold">${crypto.price.toLocaleString()}</div>
              <div className="text-sm text-white/70">{crypto.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">
              {crypto.amount} {crypto.symbol}
              {hasRecentTransaction && (
                <Bell className="h-4 w-4 text-green-500 inline ml-2 animate-pulse" />
              )}
            </div>
            <div className="text-sm text-gray-400">${crypto.value.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
