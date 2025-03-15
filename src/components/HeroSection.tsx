
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Shield, Coins } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = containerRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 pb-32"
    >
      {/* Small decorative elements */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-crypto-light-blue/10 rounded-full blur-[100px] -z-5" />
      <div className="absolute bottom-1/3 right-1/5 w-64 h-64 bg-crypto-bright-teal/10 rounded-full blur-[80px] -z-5" />
      
      {/* Hero content */}
      <div className="max-w-4xl mx-auto">
        <div className="animate-on-scroll opacity-0">
          <span className="inline-block px-4 py-2 rounded-full text-xs md:text-sm bg-white/5 border border-white/10 text-white/80 mb-6">
            Welcome to the Next-Gen Crypto Trading Platform
          </span>
        </div>
        
        <h1 className="animate-on-scroll opacity-0 text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="gradient-text">Your Crypto Journey</span>
          <br /> Starts Here
        </h1>
        
        <p className="animate-on-scroll opacity-0 text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
          Trade with confidence on a platform built for both newcomers and experts alike. Experience secure, intuitive crypto trading at your fingertips.
        </p>
        
        <div className="animate-on-scroll opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/markets">
            <Button variant="outline" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/5">
              Tradable Assets
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button  className="h-12 px-8 text-base bg-gradient-to-r from-crypto-light-blue to-crypto-bright-teal hover:opacity-90 text-white flex items-center gap-2">
              Claim Reward
            </Button>
          </Link>
        </div>
        
        {/* Features section */}
        <div className="animate-on-scroll opacity-0 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              icon: <TrendingUp className="text-crypto-light-blue" size={28} />,
              title: "Real-Time Trading",
              description: "Access live market data with instant updates and dynamic charts."
            },
            {
              icon: <Shield className="text-crypto-bright-teal" size={28} />,
              title: "Secure Transactions",
              description: "Enhanced security protocols to keep your assets safe at all times."
            },
            {
              icon: <Coins className="text-crypto-warning-yellow" size={28} />,
              title: "Diverse Portfolio",
              description: "Trade a wide range of cryptocurrencies all in one platform."
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="crypto-card p-6 hover-lift"
            >
              <div className="flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
