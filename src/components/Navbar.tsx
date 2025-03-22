
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Mail, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Track scroll for navbar background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Markets", path: "/markets" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  // Add administrator link if user is admin
  if (user && user.email?.toLowerCase().includes('admin')) {
    navLinks.push({ name: "Admin", path: "/administrator" });
  }

  const isActive = (path: string) => location.pathname === path;

  // Format date for the user profile
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Handler function for sign in button
  const handleSignIn = () => {
    // Navigate to auth page
    navigate("/auth");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-crypto-darker-blue/95 backdrop-blur shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold flex items-center transition-all hover:opacity-80"
          >
            <span className="gradient-text">Nex</span>
            <span className="text-white">crypto</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-all duration-300 hover:text-crypto-light-blue ${
                  isActive(link.path)
                    ? "text-crypto-light-blue border-b-2 border-crypto-light-blue"
                    : "text-white/80"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Auth button */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="relative cursor-pointer">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-9 h-9 rounded-full border-2 border-crypto-light-blue/30 hover:border-crypto-light-blue transition-all"
                        />
                      ) : (
                        <User className="w-9 h-9 p-1.5 bg-crypto-medium-blue rounded-full text-white/80" />
                      )}
                      <div className="absolute w-3 h-3 bg-crypto-success-green rounded-full bottom-0 right-0 border-2 border-crypto-darker-blue"></div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 backdrop-blur-lg bg-crypto-darker-blue/95 border-crypto-medium-blue text-white p-4">
                    <div className="flex justify-between space-x-4">
                      <div className="flex-shrink-0">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            className="h-12 w-12 rounded-full border-2 border-crypto-light-blue"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-crypto-medium-blue flex items-center justify-center">
                            <User className="h-7 w-7 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-semibold">
                          {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                        </h4>
                        <div className="flex items-center text-xs text-gray-400">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Member since: {user.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                        </div>
                        {user.email?.toLowerCase().includes('admin') && (
                          <div className="mt-1">
                            <span className="bg-crypto-light-blue/20 text-crypto-light-blue text-xs px-2 py-0.5 rounded-md">
                              Admin
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-crypto-medium-blue"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                className="bg-gradient-to-r from-crypto-light-blue to-crypto-bright-teal hover:opacity-90 button-glow text-white"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="pt-6 pb-6 md:hidden animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`py-2 px-4 rounded-md transition-all ${
                    isActive(link.path)
                      ? "text-crypto-light-blue bg-crypto-medium-blue/30"
                      : "text-white/70 hover:bg-crypto-medium-blue/20"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {/* Auth button for mobile */}
              {user ? (
                <div className="flex items-center justify-between mt-2 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 p-1.5 bg-crypto-medium-blue rounded-full" />
                    )}
                    <span className="text-sm text-white/80 truncate max-w-[100px]">
                      {user.email || "User"}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-white/80 hover:text-white text-sm px-3 py-1"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full mt-2 bg-gradient-to-r from-crypto-light-blue to-crypto-bright-teal hover:opacity-90"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
