
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "There was an error signing in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            referral_code: referralCode,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Your account has been created successfully! Check your email for verification.",
      });

      if (referralCode) {
        toast({
          title: "Signup bonus applied!",
          description: "Your referral code has been recorded. You'll receive your signup bonus soon!",
        });
      }

      setActiveTab('signin');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@nexcrypto.app',
        password: 'Demo123!',
      });
      
      if (error) {
        // If login fails, try to create the demo account
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'demo@nexcrypto.app',
          password: 'Demo123!',
        });
        
        if (signUpError) throw signUpError;
        
        // Try signing in again
        await supabase.auth.signInWithPassword({
          email: 'demo@nexcrypto.app',
          password: 'Demo123!',
        });
      }
      
      toast({
        title: "Demo account",
        description: "You have been signed in with a demo account.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error with demo login:', error);
      toast({
        title: "Demo login failed",
        description: error.message || "There was an error with the demo login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">NexCrypto</CardTitle>
          <CardDescription>
            {activeTab === 'signin' 
              ? "Sign in to your account to continue" 
              : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="Your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="Create a password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                  <Input 
                    id="referral-code" 
                    type="text" 
                    placeholder="Enter referral code" 
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a referral code to receive signup bonus!
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">or</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={loading}>
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading demo...
              </>
            ) : (
              "Try Demo Account"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
