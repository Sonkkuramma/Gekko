'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DataTable } from './utils/DataTable';
import {
  Users,
  UserPlus,
  Download,
  UserCheck,
  Shield,
  Edit,
  Trash,
  Mail,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  createUser,
  updateUserRole,
  updateUserType,
  deleteUser,
} from '../_actions';

const UserList = ({ initialUsers }) => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Memoized Filters
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesType = selectedType === 'all' || user.type === selectedType;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active'
          ? new Date(user.last_seen) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          : new Date(user.last_seen) <=
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesRole && matchesType && matchesStatus;
    });
  }, [initialUsers, searchTerm, selectedRole, selectedType, selectedStatus]);

  // Analytics calculations
  const userAnalytics = useMemo(() => {
    const total = initialUsers.length;
    const activeUsers = initialUsers.filter(
      (user) =>
        new Date(user.last_seen) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const roleDistribution = initialUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const typeDistribution = initialUsers.reduce((acc, user) => {
      acc[user.type] = (acc[user.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      activeUsers,
      activePercentage: ((activeUsers / total) * 100).toFixed(1),
      roleDistribution,
      typeDistribution,
    };
  }, [initialUsers]);

  // Form Handlers
  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target);
      const result = await createUser(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('User created successfully');
      setIsAddUserDialogOpen(false);
      e.target.reset();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('role', role);

      const result = await updateUserRole(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleUpdateType = async (userId, type) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('type', type);

      const result = await updateUserType(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Type updated successfully');
    } catch (error) {
      toast.error('Failed to update type');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const formData = new FormData();
      formData.append('userId', userId);

      const result = await deleteUser(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Type', 'Role', 'Last Active'];
    const data = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.type,
      user.role,
      new Date(user.last_seen).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `users-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="flex items-center gap-2">
          <img
            src={user.avatar_url || '/api/placeholder/32/32'}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (user) => (
        <Select
          value={user.type}
          onValueChange={(value) => handleUpdateType(user.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <Select
          value={user.role}
          onValueChange={(value) => handleUpdateRole(user.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'last_seen',
      label: 'Last Active',
      render: (user) => (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              new Date(user.last_seen) >
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          {new Date(user.last_seen).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => (window.location.href = `mailto:${user.email}`)}
            >
              <Mail className="h-4 w-4 mr-2" /> Contact User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteUser(user.id)}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAnalytics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAnalytics.activePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {userAnalytics.activeUsers} active in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAnalytics.typeDistribution.premium || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-auto"
              />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Add User
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredUsers}
            columns={columns}
            pagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select name="type" defaultValue="free" disabled={isLoading}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select name="role" defaultValue="user" disabled={isLoading}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddUserDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList;
