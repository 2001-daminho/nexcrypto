
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

const Auth = () => {
  const { user } = useAuth();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const connectParam = searchParams.get('connect');
  const defaultTab = connectParam === 'wallet' ? 'wallet' : 'login';

  useEffect(() => {
    // If user is logged in and not trying to connect wallet, redirect to dashboard
    if (user && !connectParam) {
      navigate('/dashboard');
    }
  }, [user, connectParam, navigate]);

  const handleEmailSignIn = async (isSignUp = false) => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
      
      if (result.error) throw result.error;
      
      if (isSignUp && result.data?.user) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "There was an error during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign in initiated",
        description: "You'll be redirected to Google for authentication.",
      });
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "There was an error during authentication",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    if (!seedPhrase.trim()) {
      toast({
        title: "Error",
        description: "Please enter your seed phrase",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in before connecting a wallet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'receive',
          symbol: 'btc',
          amount: 0,
          status: 'pending',
          transaction_hash: `wallet-connect-${Date.now()}`
        });
        
      toast({
        title: "Wallet connection initiated",
        description: "Your wallet connection request has been received.",
      });
      
      setSeedPhrase('');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: error.message || "There was an error connecting your wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user && !connectParam) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md font-poppins">
        <Card>
          <CardHeader>
            <CardTitle>already signed in</CardTitle>
            <CardDescription>you are already authenticated</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {user.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-20 h-20 rounded-full mb-4"
              />
            )}
            <h3 className="text-xl font-bold">{user.email}</h3>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              go to dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-md font-poppins">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">sign in</TabsTrigger>
          <TabsTrigger value="wallet">connect wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>sign in</CardTitle>
              <CardDescription>sign in to access your dashboard and manage your crypto assets.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => handleEmailSignIn(false)} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleEmailSignIn(true)}
                    disabled={loading}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>connect external wallet</CardTitle>
              <CardDescription>connect your external wallet to manage your assets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seedPhrase">enter your seed phrase</Label>
                <Input
                  id="seedPhrase"
                  placeholder="enter seed phrase here..."
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                />
                <p className="text-xs text-amber-500">
                  warning: this is a demo app. never share your real seed phrase with any website.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleWalletConnect} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "connect wallet"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
