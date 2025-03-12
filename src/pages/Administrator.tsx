
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader, Search, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Admin page component
const Administrator = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [newAmount, setNewAmount] = useState('');

  // Fetch users and their assets
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all users with profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Get authentication users (admins only have access to this)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        // If this fails due to lacking admin rights, show warning but proceed with profiles
        console.warn("Unable to fetch auth users - admin access required:", authError);
        setUsers(profiles || []);
      } else {
        // Merge auth users with profiles
        const mergedUsers = profiles?.map(profile => {
          const authUser = authUsers.users.find(u => u.id === profile.id);
          return {
            ...profile,
            email: authUser?.email || 'Unknown',
            lastSignIn: authUser?.last_sign_in_at || null
          };
        }) || [];
        
        setUsers(mergedUsers);
      }
      
      // Get all crypto assets
      const { data: cryptoAssets, error: assetsError } = await supabase
        .from('crypto_assets')
        .select('*');
      
      if (assetsError) throw assetsError;
      setAssets(cryptoAssets || []);
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error loading data",
        description: "You may not have administrative permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter assets based on selected user
  const userAssets = selectedUser 
    ? assets.filter(asset => asset.user_id === selectedUser.id)
    : [];

  // Handle edit user asset
  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset);
    setNewAmount(asset.amount.toString());
    setIsEditing(true);
  };

  // Save edited asset
  const handleSaveAsset = async () => {
    if (!selectedAsset || !newAmount) return;
    
    try {
      const amount = parseFloat(newAmount);
      
      if (isNaN(amount)) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid number",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('crypto_assets')
        .update({ 
          amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAsset.id);
      
      if (error) throw error;
      
      toast({
        title: "Asset updated",
        description: `Updated ${selectedAsset.symbol} balance to ${amount}`,
      });
      
      // Refresh data
      fetchData();
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the asset",
        variant: "destructive",
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleting(true);
  };

  // Confirm delete user
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete user from authentication
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedUser.id
      );
      
      if (authError) {
        // If this fails due to lacking admin rights, try using cascade delete
        console.warn("Admin delete failed, falling back to cascade delete:", authError);
        
        // Delete profile (should cascade to assets and transactions)
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', selectedUser.id);
          
        if (profileError) throw profileError;
      }
      
      toast({
        title: "User deleted",
        description: `User ${selectedUser.display_name || selectedUser.id} has been deleted`,
      });
      
      // Refresh data
      fetchData();
      setIsDeleting(false);
      
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the user",
        variant: "destructive",
      });
    }
  };

  // View user assets
  const handleViewUserAssets = (user: any) => {
    setSelectedUser(user);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading administrator panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Administration Panel</CardTitle>
          <CardDescription>
            Manage users, assets, and system settings
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Users</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.display_name || 'Anonymous'}</TableCell>
                        <TableCell>{user.email || 'Unknown'}</TableCell>
                        <TableCell>
                          {user.lastSignIn 
                            ? new Date(user.lastSignIn).toLocaleString() 
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewUserAssets(user)}
                            >
                              Assets
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedUser && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>
                  Assets for {selectedUser.display_name || selectedUser.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAssets.length > 0 ? (
                      userAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.symbol}</TableCell>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>{asset.amount}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAsset(asset)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No assets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>All Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length > 0 ? (
                    assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono text-xs">
                          {asset.user_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{asset.symbol}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.amount}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAsset(asset)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No assets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update the balance for this asset
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="font-medium">Symbol:</div>
                <div>{selectedAsset.symbol}</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="font-medium">Name:</div>
                <div>{selectedAsset.name}</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsset}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-2 py-4">
              <div>
                <span className="font-medium">Name: </span>
                {selectedUser.display_name || 'Anonymous'}
              </div>
              <div>
                <span className="font-medium">Email: </span>
                {selectedUser.email || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">ID: </span>
                <span className="font-mono text-xs">{selectedUser.id}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Administrator;
