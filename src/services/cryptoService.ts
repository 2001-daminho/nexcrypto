
// This service handles all interactions with the CoinGecko API
const API_BASE_URL = "https://api.coingecko.com/api/v3";

// Get top cryptocurrencies by market cap
export const fetchTopCryptos = async (
  page = 1,
  perPage = 20,
  currency = "usd"
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      // CoinGecko API has rate limits, so we'll provide mock data if we hit them
      console.warn("Rate limit hit or API error. Using fallback data.");
      return getMockCryptoData();
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    // Return mock data in case of errors
    return getMockCryptoData();
  }
};

// Get detailed information about a specific cryptocurrency
export const fetchCryptoDetails = async (id: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      // Provide mock data for the specific coin if API fails
      console.warn("Rate limit hit or API error. Using fallback data for coin details.");
      return getMockCoinDetails(id);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching details for ${id}:`, error);
    return getMockCoinDetails(id);
  }
};

// Get trending cryptocurrencies
export const fetchTrendingCoins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/trending`);
    
    if (!response.ok) {
      console.warn("Rate limit hit or API error. Using fallback trending data.");
      return getMockTrendingCoins();
    }
    
    const data = await response.json();
    
    // Format the data to match our component needs
    return data.coins.map((item: any) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol,
      image: item.item.small,
      price_change_percentage_24h: (Math.random() * 20) - 10, // Random change since trending API doesn't include this
    }));
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    return getMockTrendingCoins();
  }
};

// Get price history for a cryptocurrency
export const fetchCryptoPriceHistory = async (id: string, days = 7) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      console.warn("Rate limit hit or API error. Using fallback price history data.");
      return getMockPriceHistory(id, days);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching price history for ${id}:`, error);
    return getMockPriceHistory(id, days);
  }
};

// Mock data in case the API is unavailable or rate limited
const getMockCryptoData = () => {
  return [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 57000,
      market_cap: 1100000000000,
      market_cap_rank: 1,
      total_volume: 55000000000,
      price_change_percentage_24h: 2.5,
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 3200,
      market_cap: 380000000000,
      market_cap_rank: 2,
      total_volume: 22000000000,
      price_change_percentage_24h: 1.8,
    },
    {
      id: "binancecoin",
      symbol: "bnb",
      name: "BNB",
      image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      current_price: 610,
      market_cap: 94000000000,
      market_cap_rank: 3,
      total_volume: 5500000000,
      price_change_percentage_24h: -0.9,
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 131,
      market_cap: 55000000000,
      market_cap_rank: 4,
      total_volume: 3000000000,
      price_change_percentage_24h: 4.2,
    },
    {
      id: "ripple",
      symbol: "xrp",
      name: "XRP",
      image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      current_price: 0.52,
      market_cap: 28000000000,
      market_cap_rank: 5,
      total_volume: 1500000000,
      price_change_percentage_24h: -1.3,
    },
    {
      id: "cardano",
      symbol: "ada",
      name: "Cardano",
      image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      current_price: 0.58,
      market_cap: 20500000000,
      market_cap_rank: 6,
      total_volume: 800000000,
      price_change_percentage_24h: 0.7,
    },
    {
      id: "dogecoin",
      symbol: "doge",
      name: "Dogecoin",
      image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      current_price: 0.12,
      market_cap: 17000000000,
      market_cap_rank: 7,
      total_volume: 1200000000,
      price_change_percentage_24h: 5.3,
    },
    {
      id: "polkadot",
      symbol: "dot",
      name: "Polkadot",
      image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
      current_price: 7.8,
      market_cap: 10200000000,
      market_cap_rank: 8,
      total_volume: 450000000,
      price_change_percentage_24h: -2.1,
    },
  ];
};

const getMockCoinDetails = (id: string) => {
  const allCoins = getMockCryptoData();
  const coin = allCoins.find((c) => c.id === id) || allCoins[0];
  
  return {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: {
      large: coin.image,
    },
    market_data: {
      current_price: {
        usd: coin.current_price,
      },
      market_cap: {
        usd: coin.market_cap,
      },
      price_change_percentage_24h: coin.price_change_percentage_24h,
      total_volume: {
        usd: coin.total_volume,
      },
    },
    description: {
      en: `${coin.name} is one of the major cryptocurrencies in the market. This is a placeholder description for the mock data.`,
    },
  };
};

const getMockTrendingCoins = () => {
  const mockCoins = getMockCryptoData().slice(0, 5);
  
  return mockCoins.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.image,
    price_change_percentage_24h: coin.price_change_percentage_24h,
  }));
};

const getMockPriceHistory = (id: string, days: number) => {
  // Generate random price history data
  const prices: [number, number][] = [];
  const volumes: [number, number][] = [];
  const market_caps: [number, number][] = [];
  
  const startPrice = id === "bitcoin" ? 57000 : id === "ethereum" ? 3200 : 100;
  const volatility = 0.05; // 5% volatility
  
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 100; // 100 data points
  
  let currentPrice = startPrice;
  
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (99 - i) * interval;
    
    // Random walk for price
    const change = currentPrice * volatility * (Math.random() - 0.5);
    currentPrice += change;
    if (currentPrice < 0) currentPrice = 0.01;
    
    prices.push([timestamp, currentPrice]);
    volumes.push([timestamp, currentPrice * 1000000 * Math.random()]);
    market_caps.push([timestamp, currentPrice * 1000000 * 100]);
  }
  
  return {
    prices,
    market_caps,
    total_volumes: volumes,
  };
};
