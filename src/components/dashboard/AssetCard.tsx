
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssetType } from '@/hooks/useCryptoAssets';

interface AssetCardProps {
  crypto: AssetType;
  onClick: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ crypto, onClick }) => {
  return (
    <Card 
      className="hover:border-crypto-light-blue/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={crypto.image_url || ''} alt={crypto.name} className="w-12 h-12 rounded-full" />
            <div>
              <div className="font-bold">${crypto.price.toLocaleString()}</div>
              <div className="text-sm text-white/70">{crypto.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">{crypto.amount} {crypto.symbol}</div>
            <div className="text-sm text-gray-400">${crypto.value.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
