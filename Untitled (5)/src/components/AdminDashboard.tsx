
import React, { useState } from 'react';
import { api } from "./ui/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { LogOut, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  project: string;
  workplace: string;
  designation: string;
  firstLogin: boolean;
};

type AdminDashboardProps = {
  user: User;
  data: {
    users: User[];
    jobs: any[];
    referrals: any[];
    referralLimits: { [key: string]: number };
  };
  updateData: (data: any) => void;
  onLogout: () => void;
};

export function AdminDashboard({ user, data, updateData, onLogout }: AdminDashboardProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: '',
    project: '',
    workplace: '',
    designation: ''
  });
  const handleDeleteUser = (userId: number) => {
    api.deleteUser(userId)
      .then(res => {
        if (res && res.users) {
          updateData({ ...data, users: res.users });
        }
        toast.success('User deleted successfully');
      })
      .catch(err => {
        toast.error('Failed to delete user');
        console.error('Delete user error:', err);
      });
  };

  const generatePassword = (): string => {
    return Math.random().toString(36).slice(-8);
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Frontend validation
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.project || !newUser.workplace || !newUser.designation) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newUser.role !== 'HR' && newUser.role !== 'Employee') {
      toast.error('Role must be HR or Employee.');
      return;
    }
    try {
      // Call backend API to create user
      await api.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        project: newUser.project,
        workplace: newUser.workplace,
        designation: newUser.designation
      });
      toast.success(`User created successfully! Email sent to ${newUser.email}`);
      // Refresh user list from backend
      const users = await api.getUsers();
      updateData({ ...data, users });
      setNewUser({
        name: '',
        email: '',
        role: '',
        project: '',
        workplace: '',
        designation: ''
      });
      setIsAddUserOpen(false);
    } catch (err: any) {
      if (err && err.response) {
        err.response.text().then((text: string) => {
          toast.error(`Failed to create user: ${text}`);
          console.error('Create user error:', text);
        });
      } else {
        toast.error(err.message || 'Failed to create user');
        console.error('Create user error:', err);
      }
    }
  };

  const employeeCount = data.users.filter(u => u.role === 'Employee').length;
  const hrCount = data.users.filter(u => u.role === 'HR').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1>Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new HR or Employee account. An email will be sent with login credentials.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({...newUser, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: string) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Current Project</Label>
                    <Input
                      id="project"
                      value={newUser.project}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({...newUser, project: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workplace">Place of Work</Label>
                    <Input
                      id="workplace"
                      value={newUser.workplace}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({...newUser, workplace: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={newUser.designation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({...newUser, designation: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create User
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2>Welcome, {user.name}</h2>
            <p className="text-muted-foreground">Manage users and system administration</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{data.users.filter(u => u.role !== 'Admin').length}</div>
                <p className="text-xs text-muted-foreground">
                  Excluding admin accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">HR Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{hrCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active HR accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{employeeCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active employee accounts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User List */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all system users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.users.filter(u => u.role !== 'Admin').map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4>{u.name}</h4>
                      <p className="text-sm text-muted-foreground">{u.email} • {u.role}</p>
                      <p className="text-xs text-muted-foreground">{u.designation} at {u.workplace}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm">{u.project}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.firstLogin ? 'Pending first login' : 'Active'}
                      </p>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {data.users.filter(u => u.role !== 'Admin').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users created yet. Click "Add User" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}