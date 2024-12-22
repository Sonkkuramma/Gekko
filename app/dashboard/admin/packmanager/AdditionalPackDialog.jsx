import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const packTypes = [
  { id: 'topic tests', label: 'Topic Tests' },
  { id: 'module tests', label: 'Module Tests' },
  { id: 'section tests', label: 'Section Tests' },
  { id: 'fulllength tests', label: 'Full Length Tests' },
];

const AdditionalPackDialog = ({
  open,
  onOpenChange,
  bundle,
  onPacksUpdated,
}) => {
  const [selectedPackTypes, setSelectedPackTypes] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && bundle) {
      fetchExistingPackTypes();
    }
  }, [open, bundle]);

  const fetchExistingPackTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/bundle-packs?bundleId=${bundle.bundle_id}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch existing pack types');
      }
      const data = await response.json();
      const existingPackTypes = data.packTypes.reduce((acc, packType) => {
        acc[packType] = true;
        return acc;
      }, {});
      setSelectedPackTypes(existingPackTypes);
    } catch (error) {
      console.error('Error fetching existing pack types:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackTypeSelection = (packType) => {
    setSelectedPackTypes((prev) => ({
      ...prev,
      [packType]: !prev[packType],
    }));
  };

  const handleUpdatePackTypes = async () => {
    setIsLoading(true);
    try {
      const selectedTypes = Object.entries(selectedPackTypes)
        .filter(([_, isSelected]) => isSelected)
        .map(([packType]) => packType);

      const response = await fetch('/api/bundle-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle.bundle_id,
          packTypes: selectedTypes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pack types for bundle');
      }

      const data = await response.json();
      toast.success(data.message);

      onPacksUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating pack types for bundle:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Pack Types for {bundle?.bundle_name}</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Pack Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packTypes.map((packType) => (
                  <TableRow key={packType.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPackTypes[packType.id] || false}
                        onCheckedChange={() =>
                          handlePackTypeSelection(packType.id)
                        }
                      />
                    </TableCell>
                    <TableCell>{packType.label}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleUpdatePackTypes} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Pack Types'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalPackDialog;
