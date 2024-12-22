import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import AddTestsDialog from './AddTestsDialog';

const ManagePack = () => {
  const [testPacks, setTestPacks] = useState([]);
  const [editingPack, setEditingPack] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddTestsDialogOpen, setIsAddTestsDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestPacks();
  }, []);

  const fetchTestPacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/testpacks');
      if (!response.ok) {
        throw new Error('Failed to fetch test packs');
      }
      const data = await response.json();
      setTestPacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPack((prev) => {
      const updatedPack = { ...prev, [name]: value };

      if (name === 'pack_name') {
        const slug = generateSlug(value);
        updatedPack.pack_slug = slug;
        updatedPack.pack_image_url = `/images/testpackimgs/${slug}.png`;
        updatedPack.pack_banner_url = `/images/testpackbanners/${slug}.png`;
      }

      return updatedPack;
    });
  };

  const handleSelectChange = (name, value) => {
    setEditingPack((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditingPack((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/testpacks?packId=${editingPack.pack_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingPack),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update test pack');
      }
      setIsEditDialogOpen(false);
      fetchTestPacks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (packId) => {
    if (window.confirm('Are you sure you want to delete this test pack?')) {
      try {
        const response = await fetch(`/api/testpacks?packId=${packId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete test pack');
        }
        fetchTestPacks();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddTests = (pack) => {
    setSelectedPack(pack);
    setIsAddTestsDialogOpen(true);
  };

  const handleTestsUpdated = () => {
    fetchTestPacks();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Test Packs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pack ID</TableHead>
                <TableHead>Pack Type</TableHead>
                <TableHead>Pack Name</TableHead>
                <TableHead>Pack Slug</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testPacks.map((pack) => (
                <TableRow key={pack.pack_id}>
                  <TableCell>{pack.pack_id}</TableCell>
                  <TableCell>{pack.pack_type}</TableCell>
                  <TableCell>{pack.pack_name}</TableCell>
                  <TableCell>{pack.pack_slug}</TableCell>
                  <TableCell>{pack.is_premium ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(pack)} className="mr-2">
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(pack.pack_id)}
                      variant="destructive"
                      className="mr-2"
                    >
                      Delete
                    </Button>
                    <Button onClick={() => handleAddTests(pack)}>
                      Manage Tests
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Test Pack</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Select
              name="pack_type"
              value={editingPack?.pack_type || ''}
              onValueChange={(value) => handleSelectChange('pack_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Pack Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="topic tests">Topic Tests</SelectItem>
                <SelectItem value="module tests">Module Tests</SelectItem>
                <SelectItem value="section tests">Section Tests</SelectItem>
                <SelectItem value="fulllength tests">
                  Full Length Tests
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="pack_name"
              value={editingPack?.pack_name || ''}
              onChange={handleInputChange}
              placeholder="Pack Name"
            />
            <Input
              name="pack_slug"
              value={editingPack?.pack_slug || ''}
              readOnly
              placeholder="Pack Slug (auto-generated)"
            />
            <Input
              name="pack_image_url"
              value={editingPack?.pack_image_url || ''}
              readOnly
              placeholder="Pack Image URL (auto-generated)"
            />
            <Input
              name="pack_banner_url"
              value={editingPack?.pack_banner_url || ''}
              readOnly
              placeholder="Pack Banner URL (auto-generated)"
            />
            <Input
              name="pack_short_description"
              value={editingPack?.pack_short_description || ''}
              onChange={handleInputChange}
              placeholder="Short Description"
            />
            <Textarea
              name="pack_long_description"
              value={editingPack?.pack_long_description || ''}
              onChange={handleInputChange}
              placeholder="Long Description"
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_premium"
                name="is_premium"
                checked={editingPack?.is_premium || false}
                onCheckedChange={(checked) =>
                  handleCheckboxChange({
                    target: { name: 'is_premium', checked },
                  })
                }
              />
              <label htmlFor="is_premium">Premium</label>
            </div>
            <Button type="submit">Update Pack</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AddTestsDialog
        open={isAddTestsDialogOpen}
        onOpenChange={setIsAddTestsDialogOpen}
        pack={selectedPack}
        onTestsUpdated={handleTestsUpdated}
      />
    </div>
  );
};

export default ManagePack;
