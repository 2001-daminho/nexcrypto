
import { useState } from "react";
import { useTopCryptos } from "@/hooks/useCryptoData";
import { CryptoCard } from "@/components/CryptoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const Markets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data: cryptos, isLoading, isFetching } = useTopCryptos(page, 20);
  
  // Filter cryptos based on search term
  const filteredCryptos = cryptos?.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-transition container section-padding animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cryptocurrency Markets</h1>
          <p className="text-white/70">
            Explore and trade the top cryptocurrencies by market capitalization
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
            <Input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-crypto-medium-blue/50 border-white/10 focus:border-crypto-light-blue/50 w-full md:w-64"
            />
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex overflow-x-auto scrollbar-none py-4 mb-6 border-b border-white/10">
        <Button
          variant="ghost"
          className="text-white/90 hover:text-white hover:bg-white/5 mr-2"
        >
          All Assets
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(12)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="crypto-card h-64 animate-pulse"></div>
            ))}
        </div>
      ) : filteredCryptos?.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-xl">
          <p className="text-xl text-white/70 mb-4">No cryptocurrencies found matching "{searchTerm}"</p>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCryptos?.map((crypto) => (
              <CryptoCard key={crypto.id} coin={crypto} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              className="mr-2 border-white/10 hover:bg-white/5"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              disabled={isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Markets;
