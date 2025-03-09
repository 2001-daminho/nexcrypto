
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Send,
  BarChart4,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CryptoCardProps {
  coin: {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
  };
}

export function CryptoCard({ coin }: CryptoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return formatCurrency(value);
    }
  };

  const handleCopyAddress = () => {
    // Generate a sample wallet address based on the coin's name
    const dummyAddress = `${coin.symbol.toLowerCase()}1${coin.id
      .split("")
      .map((c) => c.charCodeAt(0).toString(16))
      .join("")
      .substring(0, 34)}`;

    navigator.clipboard.writeText(dummyAddress);
    toast({
      title: "Address copied",
      description: "Wallet address has been copied to clipboard",
    });
  };

  const handleConnect = () => {
    // In a real app, this would open a wallet connection modal
    toast({
      title: "Connect wallet",
      description: "This would open a wallet connection flow",
    });
  };

  const handleSend = () => {
    // In a real app, this would open a send transaction modal
    toast({
      title: "Send coins",
      description: "This would open a transaction form",
    });
  };

  return (
    <div className="crypto-card overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-semibold text-lg">{coin.name}</div>
            <div className="text-white/50 text-xs uppercase">{coin.symbol}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowActions(!showActions)}
          className="text-white/70 hover:text-white hover:bg-white/5"
        >
          <BarChart4 size={18} />
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-semibold">
            {formatCurrency(coin.current_price)}
          </span>
          <span
            className={`flex items-center text-xs px-2 py-1 rounded ${
              coin.price_change_percentage_24h >= 0
                ? "bg-crypto-success-green/10 text-crypto-success-green"
                : "bg-crypto-error-red/10 text-crypto-error-red"
            }`}
          >
            {coin.price_change_percentage_24h >= 0 ? (
              <ArrowUpRight size={14} className="mr-1" />
            ) : (
              <ArrowDownRight size={14} className="mr-1" />
            )}
            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="text-xs text-white/50">
            Market Cap
            <div className="text-white font-medium">
              {formatLargeNumber(coin.market_cap)}
            </div>
          </div>
          <div className="text-xs text-white/50">
            Volume (24h)
            <div className="text-white font-medium">
              {formatLargeNumber(coin.total_volume)}
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs flex items-center justify-center gap-1.5"
            onClick={handleConnect}
          >
            <Wallet size={14} />
            Receive
          </Button>
          <Button
            variant="outline"
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs flex items-center justify-center gap-1.5"
            onClick={handleSend}
          >
            <Send size={14} />
            Send
          </Button>
          <div className="col-span-2 mt-2 p-2 bg-white/5 rounded-md flex items-center justify-between">
            <div className="truncate text-xs text-white/70 w-[85%]">
              {`${coin.symbol.toLowerCase()}1${coin.id
                .split("")
                .map((c) => c.charCodeAt(0).toString(16))
                .join("")
                .substring(0, 8)}...`}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopyAddress}
            >
              <Copy size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
