
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Administrator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*');
      
      if (adminError) throw adminError;
      
      // Fetch all users' crypto assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('crypto_assets')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (assetsError) throw assetsError;
      
      // Fetch recent transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (txError) throw txError;
      
      setUsers(adminUsers || []);
      setAssets(assetsData || []);
      setTransactions(txData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading the admin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const addAdmin = async () => {
    if (!adminEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({ email: adminEmail });
      
      if (error) throw error;
      
      toast({
        title: "Admin Added",
        description: `${adminEmail} has been added as an admin.`,
      });
      
      setAdminEmail('');
      fetchData();
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem adding the admin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Administrator Panel</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Administrator</CardTitle>
              <CardDescription>Add new admin users to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="admin-email" className="sr-only">Email</Label>
                  <Input 
                    id="admin-email"
                    placeholder="Enter email address"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <Button onClick={addAdmin}>Add Admin</Button>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Current Administrators</h3>
                {users.length > 0 ? (
                  <ul className="space-y-1">
                    {users.map((user, i) => (
                      <li key={i} className="text-sm bg-secondary p-2 rounded">
                        {user.email}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No administrators added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 20 transactions across all users</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.user_id.substring(0, 8)}...</TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell>{tx.symbol}</TableCell>
                        <TableCell>{Number(tx.amount).toFixed(6)}</TableCell>
                        <TableCell className="capitalize">{tx.status}</TableCell>
                        <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions found.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Assets</CardTitle>
              <CardDescription>Overview of user holdings</CardDescription>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono text-xs">{asset.user_id.substring(0, 8)}...</TableCell>
                        <TableCell>{asset.symbol}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{Number(asset.amount).toFixed(6)}</TableCell>
                        <TableCell>{new Date(asset.updated_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No assets found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Administrator;
