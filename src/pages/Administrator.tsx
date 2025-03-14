import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash, X, Check, Search, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editAssetId, setEditAssetId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, email, created_at')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setUsers(data as User[]);
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
    
    fetchUsers();
  }, []);

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
      if (isNaN(amount) || amount < 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('crypto_assets')
        .update({ amount })
        .eq('id', assetId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Asset balance updated successfully"
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

  const handleDeleteUser = async (userId: string) => {
    try {
      // In a real app, this would call a secure admin API endpoint
      // that handles user deletion and all associated data
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      
      // Update local state
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setUserAssets([]);
      }
      
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

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {user && (
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
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
                    <CardTitle>Assets for {selectedUser.email}</CardTitle>
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
    </div>
  );
};

export default Administrator;
