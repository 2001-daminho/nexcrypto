
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash, X, Check, Search, LogOut, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

type User = {
  id: string;
  email: string;
  created_at: string;
};

type Asset = {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  amount: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

const Administrator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editAssetId, setEditAssetId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [newAssetSymbol, setNewAssetSymbol] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetAmount, setNewAssetAmount] = useState('');

  // Check if user is logged in and redirect if not
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the administrator page",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, created_at')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Format profiles to match User type
          const formattedUsers = data.map(profile => ({
            id: profile.id,
            email: profile.display_name || 'User',
            created_at: profile.created_at || new Date().toISOString()
          }));
          
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchUsers();
    }
  }, [user, toast]);

  // Fetch user assets when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserAssets(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUserAssets = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (data) {
        setUserAssets(data.map(asset => ({
          ...asset,
          amount: Number(asset.amount)
        })));
      }
    } catch (error) {
      console.error('Error fetching user assets:', error);
      toast({
        title: "Error",
        description: "Failed to load user assets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditAssetId(asset.id);
    setEditAmount(asset.amount.toString());
  };

  const handleCancelEdit = () => {
    setEditAssetId(null);
    setEditAmount('');
  };

  const handleSaveAsset = async (assetId: string) => {
    try {
      const amount = parseFloat(editAmount);
      if (isNaN(amount)) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }

      // Find the asset being edited
      const asset = userAssets.find(a => a.id === assetId);
      if (!asset) return;

      // Check if the amount is being increased (credited)
      const isIncrease = amount > asset.amount;
      
      // Update the asset in the database
      const { error } = await supabase
        .from('crypto_assets')
        .update({ amount })
        .eq('id', assetId);
        
      if (error) throw error;
      
      // If this is an account credit (increased amount), create a notification
      if (isIncrease) {
        const amountAdded = amount - asset.amount;
        const { error: notificationError } = await supabase
          .from('transactions')
          .insert({
            user_id: asset.user_id,
            symbol: asset.symbol,
            amount: amountAdded,
            type: 'receive',
            status: 'completed',
            recipient_address: 'ADMIN_CREDIT',
            transaction_hash: `admin_credit_${Date.now()}`,
            price_usd: 0 // We don't have the price here, but it's not critical
          });
          
        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }
      
      toast({
        title: "Success",
        description: `Asset balance ${isIncrease ? 'credited' : 'updated'} successfully`
      });
      
      // Update local state
      setUserAssets(userAssets.map(asset => 
        asset.id === assetId ? { ...asset, amount } : asset
      ));
      
      // Reset edit state
      setEditAssetId(null);
      setEditAmount('');
      
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: "Failed to update asset balance",
        variant: "destructive"
      });
    }
  };

  const handleAddAsset = async () => {
    if (!selectedUser) return;
    
    try {
      if (!newAssetSymbol || !newAssetName || !newAssetAmount) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      
      const amount = parseFloat(newAssetAmount);
      if (isNaN(amount)) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }
      
      // Create a new asset for the user
      const { error, data } = await supabase
        .from('crypto_assets')
        .insert({
          user_id: selectedUser.id,
          symbol: newAssetSymbol.toLowerCase(),
          name: newAssetName,
          amount,
          image_url: `https://cryptologos.cc/logos/${newAssetSymbol.toLowerCase()}-${newAssetSymbol.toLowerCase()}-logo.png`
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Asset added successfully"
      });
      
      // Update local state
      setUserAssets([...userAssets, { ...data, amount: Number(data.amount) }]);
      
      // Reset form
      setNewAssetSymbol('');
      setNewAssetName('');
      setNewAssetAmount('');
      setShowAddAssetDialog(false);
      
    } catch (error) {
      console.error('Error adding asset:', error);
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // This will just show a message since we can't delete users without admin rights
      toast({
        title: "Information",
        description: "User deletion requires admin privileges and is disabled in this demo",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. This operation requires admin privileges.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(
    user => user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If user is not logged in, show a message
  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">Please sign in to access the administrator page.</p>
        <Button onClick={() => navigate('/auth')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Users</span>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                        selectedUser?.id === user.id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No users found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <Tabs defaultValue="assets">
              <TabsList className="grid w-full grid-cols-1 mb-6">
                <TabsTrigger value="assets">User Assets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assets">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Assets for {selectedUser.email}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAddAssetDialog(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Asset
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading assets...</div>
                    ) : userAssets.length > 0 ? (
                      <div className="space-y-4">
                        {userAssets.map(asset => (
                          <div key={asset.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                {asset.image_url && (
                                  <img 
                                    src={asset.image_url} 
                                    alt={asset.name} 
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{asset.name}</div>
                                  <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                                </div>
                              </div>
                              
                              {editAssetId === asset.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-32"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleSaveAsset(asset.id)}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">{asset.amount} {asset.symbol}</div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditAsset(asset)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No assets found for this user
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-muted-foreground">Select a user to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Asset Dialog */}
      <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assetSymbol">Symbol</Label>
              <Input
                id="assetSymbol"
                placeholder="e.g. btc, eth, sol"
                value={newAssetSymbol}
                onChange={(e) => setNewAssetSymbol(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetName">Name</Label>
              <Input
                id="assetName"
                placeholder="e.g. Bitcoin, Ethereum"
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetAmount">Amount</Label>
              <Input
                id="assetAmount"
                placeholder="0.00"
                value={newAssetAmount}
                onChange={(e) => setNewAssetAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAssetDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAsset}>Add Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Administrator;
