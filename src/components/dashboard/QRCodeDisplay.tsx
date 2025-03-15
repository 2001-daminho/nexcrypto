
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Manually defined addresses for each cryptocurrency
const CRYPTO_ADDRESSES = {
  btc: 'bc1qkrl6s3amnt63j5f26rf2j45qrte5d3kzjg0akr',
  eth: '0x765d0532de7b7568b9aDE94200Dc7c44b491A973',
  sol: 'FBQYegkK7my5gdbyFkxmoFGGHKusPW9UPjKGJDrG5cu1',
  usdt: '0x765d0532de7b7568b9aDE94200Dc7c44b491A973',
  usdc: 'FBQYegkK7my5gdbyFkxmoFGGHKusPW9UPjKGJDrG5cu1'
};

// Fixed QR code images for each cryptocurrency
const QR_CODE_IMAGES = {
  btc: '/public/lovable-uploads/btc.jpg',
  eth: '/public/lovable-uploads/eth.jpg',
  sol: '/public/lovable-uploads/sol.jpg',
  usdt: '/public/lovable-uploads/usdt.jpg',
  usdc: '/public/lovable-uploads/usdc.jpg'
};

interface QRCodeDisplayProps {
  cryptoSymbol: string;
  cryptoName: string;
  onCopyAddress: (address: string) => void;
  imageUrl: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  cryptoSymbol,
  cryptoName,
  onCopyAddress,
  imageUrl
}) => {
  const symbol = cryptoSymbol.toLowerCase();
  const address = CRYPTO_ADDRESSES[symbol as keyof typeof CRYPTO_ADDRESSES] || 
    `${symbol}1randomaddress123456789`;
  
  const qrCodeImage = QR_CODE_IMAGES[symbol as keyof typeof QR_CODE_IMAGES] || 
    '/public/lovable-uploads/14b5ef2a-6390-48ff-bb5a-34e93d47d0df.png';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>address</CardTitle>
          <CardTitle>{cryptoSymbol}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-48 h-48 mx-auto bg-white p-2 rounded-lg">
          <img 
            src={qrCodeImage} 
            alt="QR Code" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <p className="text-center mt-6 text-gray-500">
          send only {cryptoSymbol} to this deposit address. this address does not support deposit of non-fungible tokens.
        </p>
        
        <div className="flex w-full mt-6 border rounded-md overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 p-3">
            {cryptoSymbol}
          </div>
          <div className="flex-1 p-3 truncate overflow-hidden">
            {address}
          </div>
          <Button variant="ghost" className="p-3 border-l" onClick={() => onCopyAddress(address)}>
            copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
