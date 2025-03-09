
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const Auth = () => {
  const { user, signIn, connectWallet } = useAuth();
  const [seedPhrase, setSeedPhrase] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const connectParam = searchParams.get('connect');
  const defaultTab = connectParam === 'wallet' ? 'wallet' : 'login';

  const handleSignIn = async () => {
    await signIn();
    navigate('/dashboard');
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

    await connectWallet(seedPhrase);
    setSeedPhrase('');
    
    // Only navigate if user is already logged in
    if (user) {
      navigate('/dashboard');
    }
  };

  if (user && !connectParam) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Already Signed In</CardTitle>
            <CardDescription>You are already authenticated</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-20 h-20 rounded-full mb-4"
              />
            )}
            <h3 className="text-xl font-bold">{user.displayName || user.email}</h3>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="wallet">Connect Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Sign in to access your dashboard and manage your crypto assets.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex justify-center">
                <Button onClick={handleSignIn} className="w-full">
                  Sign In with Google
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">
                This is a demo application. The actual Google Authentication is mocked.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Connect External Wallet</CardTitle>
              <CardDescription>Connect your external wallet to manage your assets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seedPhrase">Enter your seed phrase</Label>
                <Input
                  id="seedPhrase"
                  placeholder="Enter seed phrase here..."
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                />
                <p className="text-xs text-amber-500">
                  Warning: This is a demo app. Never share your real seed phrase with any website.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleWalletConnect} className="w-full">
                Connect Wallet
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
