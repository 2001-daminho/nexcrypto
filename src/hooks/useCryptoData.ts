
import { useQuery } from "@tanstack/react-query";
import { fetchTopCryptos, fetchCryptoDetails, fetchCryptoPriceHistory } from "@/services/cryptoService";

// Hook for fetching top cryptocurrencies
export function useTopCryptos(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["topCryptos", page, perPage],
    queryFn: () => fetchTopCryptos(page, perPage),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Hook for fetching details about a specific cryptocurrency
export function useCryptoDetails(id: string) {
  return useQuery({
    queryKey: ["cryptoDetails", id],
    queryFn: () => fetchCryptoDetails(id),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!id, // Only run if id is provided
  });
}

// Hook for fetching price history of a cryptocurrency
export function useCryptoPriceHistory(id: string, days = 7) {
  return useQuery({
    queryKey: ["cryptoPriceHistory", id, days],
    queryFn: () => fetchCryptoPriceHistory(id, days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
}
