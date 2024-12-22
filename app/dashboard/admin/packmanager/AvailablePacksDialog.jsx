import React, { useState, useEffect } from 'react';
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

const AvailablePacksDialog = ({ open, onOpenChange, bundle }) => {
  const [availablePacks, setAvailablePacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && bundle) {
      fetchAvailablePacks();
    }
  }, [open, bundle]);

  const fetchAvailablePacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/packs?examId=${bundle.exam_id}&difficulty=${bundle.bundle_difficulty}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch available packs');
      }
      const data = await response.json();
      setAvailablePacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Available Packs for {bundle?.bundle_name}</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pack ID</TableHead>
                <TableHead>Pack Name</TableHead>
                <TableHead>Pack Type</TableHead>
                <TableHead>Difficulty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availablePacks.map((pack) => (
                <TableRow key={pack.pack_id}>
                  <TableCell>{pack.pack_id}</TableCell>
                  <TableCell>{pack.pack_name}</TableCell>
                  <TableCell>{pack.pack_type}</TableCell>
                  <TableCell>{pack.pack_difficulty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvailablePacksDialog;
