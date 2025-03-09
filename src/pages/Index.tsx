
import { HeroSection } from "@/components/HeroSection";
import { TrendingCoins } from "@/components/TrendingCoins";
import { useTopCryptos } from "@/hooks/useCryptoData";
import { CryptoCard } from "@/components/CryptoCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Wallet, TrendingUp, BarChart3 } from "lucide-react";

const Index = () => {
  const { data: topCryptos, isLoading } = useTopCryptos(1, 4);

  return (
    <div className="page-transition">
      {/* Hero section */}
      <HeroSection />
      
      {/* Trending coins ticker */}
      <div className="py-6 bg-crypto-medium-blue/30 border-y border-white/5">
        <div className="container mx-auto">
          <TrendingCoins />
        </div>
      </div>
      
      {/* Featured cryptocurrencies */}
      <section className="section-padding container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Featured Cryptocurrencies</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Track and trade the top performing digital assets in the market with our comprehensive platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="crypto-card h-48 animate-pulse"
                  ></div>
                ))
            : topCryptos?.map((coin) => (
                <CryptoCard key={coin.id} coin={coin} />
              ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/markets">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 px-6"
            >
              View All Markets
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Features section */}
      <section className="section-padding bg-crypto-medium-blue/30 border-y border-white/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose examplecrypto</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Experience the next level of crypto trading with our powerful features and user-friendly interface.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="text-crypto-light-blue" size={28} />,
                title: "Secure Platform",
                description:
                  "Enterprise-grade security to protect your assets and personal information.",
              },
              {
                icon: <Wallet className="text-crypto-bright-teal" size={28} />,
                title: "Multi-Wallet Support",
                description:
                  "Connect and manage multiple wallets for different cryptocurrencies.",
              },
              {
                icon: <TrendingUp className="text-crypto-success-green" size={28} />,
                title: "Real-Time Data",
                description:
                  "Access to live market data and price charts for informed trading decisions.",
              },
              {
                icon: <BarChart3 className="text-crypto-warning-yellow" size={28} />,
                title: "Advanced Analytics",
                description:
                  "Comprehensive market analysis tools to track your portfolio performance.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="crypto-card p-8 text-center hover-lift"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-white/5">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="section-padding container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Crypto Journey?</h2>
          <p className="text-white/70 mb-8">
            Join thousands of traders who have already discovered the potential of cryptocurrency trading with examplecrypto.
          </p>
          <Link to="/markets">
            <Button
              size="lg"
              className="button-glow bg-gradient-to-r from-crypto-light-blue to-crypto-bright-teal hover:opacity-90 text-white px-8 py-6 text-lg"
            >
              Get Started Now
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
