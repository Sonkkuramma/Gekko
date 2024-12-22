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
import PacksSelector from './PacksSelector';

const packTypes = [
  { id: 'topic tests', label: 'Topic Tests' },
  { id: 'module tests', label: 'Module Tests' },
  { id: 'section tests', label: 'Section Tests' },
  { id: 'fulllength tests', label: 'Full Length Tests' },
];

const ManageBundles = () => {
  const [bundles, setBundles] = useState([]);
  const [editingBundle, setEditingBundle] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPacksSelectorDialogOpen, setIsPacksSelectorDialogOpen] =
    useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchBundles();
    fetchExams();
  }, []);

  const fetchBundles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bundles');
      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }
      const data = await response.json();
      setBundles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/testpacks?action=getExams');
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const data = await response.json();
      setExams(data);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBundle((prev) => {
      const updatedBundle = { ...prev, [name]: value };

      if (name === 'bundle_name') {
        const slug = generateSlug(value);
        updatedBundle.bundle_slug = slug;
        updatedBundle.bundle_image_url = `/images/bundleimgs/${slug}.png`;
        updatedBundle.bundle_banner_url = `/images/bundlebanners/${slug}.png`;
      }

      return updatedBundle;
    });
  };

  const handleSelectChange = (name, value) => {
    setEditingBundle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditingBundle((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePackTypeChange = (packType) => {
    setEditingBundle((prev) => {
      const currentPackTypes = Array.isArray(prev.pack_types)
        ? prev.pack_types
        : [];
      const updatedPackTypes = currentPackTypes.includes(packType)
        ? currentPackTypes.filter((type) => type !== packType)
        : [...currentPackTypes, packType];
      return { ...prev, pack_types: updatedPackTypes };
    });
  };

  const handleEdit = (bundle) => {
    // Ensure pack_types is always an array
    const bundleWithArrayPackTypes = {
      ...bundle,
      pack_types: Array.isArray(bundle.pack_types)
        ? bundle.pack_types
        : bundle.pack_types?.split(',') || [],
    };
    setEditingBundle(bundleWithArrayPackTypes);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/bundles?id=${editingBundle.bundle_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingBundle),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bundle');
      }

      setIsEditDialogOpen(false);
      await fetchBundles();
    } catch (err) {
      console.error('Error updating bundle:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (bundleId) => {
    if (window.confirm('Are you sure you want to delete this bundle?')) {
      try {
        const response = await fetch(`/api/bundles?id=${bundleId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete bundle');
        }
        fetchBundles();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleManagePacks = (bundle) => {
    setSelectedBundle(bundle);
    setIsPacksSelectorDialogOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Bundles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bundle ID</TableHead>
                <TableHead>Bundle Types</TableHead>
                <TableHead>Bundle Name</TableHead>
                <TableHead>Bundle Slug</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.map((bundle) => (
                <TableRow key={bundle.bundle_id}>
                  <TableCell>{bundle.bundle_id}</TableCell>
                  <TableCell>
                    {Array.isArray(bundle.pack_types)
                      ? bundle.pack_types.join(', ')
                      : bundle.pack_types?.split(',').join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>{bundle.bundle_name}</TableCell>
                  <TableCell>{bundle.bundle_slug}</TableCell>
                  <TableCell>{bundle.is_premium ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(bundle)} className="mr-2">
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(bundle.bundle_id)}
                      variant="destructive"
                      className="mr-2"
                    >
                      Delete
                    </Button>
                    <Button onClick={() => handleManagePacks(bundle)}>
                      Update Packs
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
            <DialogTitle>Edit Bundle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Exam Name
              </label>
              <Select
                value={editingBundle?.exam_id || ''}
                onValueChange={(value) => handleSelectChange('exam_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.exam_id} value={exam.exam_id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700 mb-2">
                Pack Types
              </h3>
              {packTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={editingBundle?.pack_types?.includes(type.id)}
                    onCheckedChange={() => handlePackTypeChange(type.id)}
                  />
                  <label htmlFor={type.id}>{type.label}</label>
                </div>
              ))}
            </div>

            <Input
              name="bundle_name"
              value={editingBundle?.bundle_name || ''}
              onChange={handleInputChange}
              placeholder="Bundle Name"
            />

            <Input
              name="bundle_slug"
              value={editingBundle?.bundle_slug || ''}
              readOnly
              placeholder="Bundle Slug (auto-generated)"
            />

            <Input
              name="bundle_short_description"
              value={editingBundle?.bundle_short_description || ''}
              onChange={handleInputChange}
              placeholder="Short Description"
            />

            <Textarea
              name="bundle_long_description"
              value={editingBundle?.bundle_long_description || ''}
              onChange={handleInputChange}
              placeholder="Long Description"
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_premium"
                name="is_premium"
                checked={editingBundle?.is_premium || false}
                onCheckedChange={(checked) =>
                  handleCheckboxChange({
                    target: { name: 'is_premium', checked },
                  })
                }
              />
              <label htmlFor="is_premium">Premium</label>
            </div>

            <Input
              name="bundle_image_url"
              value={editingBundle?.bundle_image_url || ''}
              readOnly
              placeholder="Bundle Image URL (auto-generated)"
            />

            <Input
              name="bundle_banner_url"
              value={editingBundle?.bundle_banner_url || ''}
              readOnly
              placeholder="Bundle Banner URL (auto-generated)"
            />

            <Button type="submit">Update Bundle</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPacksSelectorDialogOpen}
        onOpenChange={setIsPacksSelectorDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Update Packs for {selectedBundle?.bundle_name}
            </DialogTitle>
          </DialogHeader>
          <PacksSelector
            bundleId={selectedBundle?.bundle_id}
            onClose={() => setIsPacksSelectorDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBundles;
