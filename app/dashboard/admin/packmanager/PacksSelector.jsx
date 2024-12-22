import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const PacksSelector = ({ bundleId, onClose }) => {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPacks();
  }, [bundleId]);

  const fetchPacks = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching packs for bundleId:', bundleId);
      const response = await fetch(`/api/packs?bundleId=${bundleId}`);

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to fetch packs: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Fetched packs:', data);

      setPacks(data.packs || []);
    } catch (err) {
      console.error('Error fetching packs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePack = async (packId) => {
    try {
      const pack = packs.find((p) => p.pack_id === packId);
      const method = pack.is_allocated ? 'DELETE' : 'POST';
      const url = `/api/bundle-packs?bundleId=${bundleId}&packId=${packId}`;

      const response = await fetch(url, { method });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update pack allocation: ${errorData.message}`
        );
      }

      fetchPacks();
    } catch (err) {
      console.error('Error updating pack allocation:', err);
      setError(err.message);
    }
  };

  const handleAddPack = async () => {
    if (!selectedPack) return;
    await handleTogglePack(selectedPack);
    setSelectedPack('');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const availablePacks = packs.filter((pack) => !pack.is_allocated);
  const allocatedPacks = packs.filter((pack) => pack.is_allocated);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Select value={selectedPack} onValueChange={setSelectedPack}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a pack" />
          </SelectTrigger>
          <SelectContent>
            {availablePacks.map((pack) => (
              <SelectItem key={pack.pack_id} value={pack.pack_id}>
                {pack.pack_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddPack}>Add Pack</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pack ID</TableHead>
            <TableHead>Pack Name</TableHead>
            <TableHead>Pack Type</TableHead>
            {/* <TableHead>Difficulty</TableHead> */}
            <TableHead>Allocated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packs.map((pack) => (
            <TableRow key={pack.pack_id}>
              <TableCell>{pack.pack_id}</TableCell>
              <TableCell>{pack.pack_name}</TableCell>
              <TableCell>{pack.pack_type}</TableCell>
              {/* <TableCell>{pack.pack_difficulty}</TableCell> */}
              <TableCell>
                <Checkbox
                  checked={pack.is_allocated}
                  onCheckedChange={() => handleTogglePack(pack.pack_id)}
                />
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleTogglePack(pack.pack_id)}
                  variant={pack.is_allocated ? 'destructive' : 'default'}
                >
                  {pack.is_allocated ? 'Remove' : 'Add'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default PacksSelector;
