
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fetchTrendingCoins } from "@/services/cryptoService";

export function TrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTrendingCoins = async () => {
      try {
        const data = await fetchTrendingCoins();
        setTrendingCoins(data);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      } finally {
        setLoading(false);
      }
    };

    getTrendingCoins();
  }, []);

  // Add subtle movement animation to create visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendingCoins((prevCoins) => {
        if (!prevCoins.length) return prevCoins;
        
        // Create a copy and modify price change values slightly to simulate live updates
        return prevCoins.map((coin) => ({
          ...coin,
          price_change_percentage_24h:
            coin.price_change_percentage_24h +
            (Math.random() * 0.4 - 0.2) // Small random fluctuation
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex overflow-hidden py-4 px-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-3 h-16 w-48 bg-white/5 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Gradient fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-crypto-dark-blue to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-crypto-dark-blue to-transparent z-10"></div>
      
      <div className="flex overflow-x-auto scrollbar-none py-4 px-1">
        <div className="flex animate-[scroll_60s_linear_infinite]">
          {trendingCoins.map((coin, index) => (
            <div
              key={`${coin.id}-${index}`}
              className="flex-shrink-0 mx-3 glass-card h-16 px-4 rounded-xl hover-scale flex items-center"
            >
              <img
                src={coin.image}
                alt={coin.name}
                className="w-8 h-8 mr-3 rounded-full"
              />
              <div className="mr-4">
                <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                <div className="text-xs text-white/60 -mt-0.5">{coin.name}</div>
              </div>
              <div
                className={`flex items-center text-xs ${
                  coin.price_change_percentage_24h >= 0
                    ? "text-crypto-success-green"
                    : "text-crypto-error-red"
                }`}
              >
                {coin.price_change_percentage_24h >= 0 ? (
                  <ArrowUpRight size={14} className="mr-1" />
                ) : (
                  <ArrowDownRight size={14} className="mr-1" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          ))}
          
          {/* Duplicate items for continuous scrolling */}
          {trendingCoins.map((coin, index) => (
            <div
              key={`${coin.id}-duplicate-${index}`}
              className="flex-shrink-0 mx-3 glass-card h-16 px-4 rounded-xl hover-scale flex items-center"
            >
              <img
                src={coin.image}
                alt={coin.name}
                className="w-8 h-8 mr-3 rounded-full"
              />
              <div className="mr-4">
                <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                <div className="text-xs text-white/60 -mt-0.5">{coin.name}</div>
              </div>
              <div
                className={`flex items-center text-xs ${
                  coin.price_change_percentage_24h >= 0
                    ? "text-crypto-success-green"
                    : "text-crypto-error-red"
                }`}
              >
                {coin.price_change_percentage_24h >= 0 ? (
                  <ArrowUpRight size={14} className="mr-1" />
                ) : (
                  <ArrowDownRight size={14} className="mr-1" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
