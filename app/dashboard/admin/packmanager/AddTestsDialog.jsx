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

const AddTestsDialog = ({ open, onOpenChange, pack, onTestsUpdated }) => {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && pack) {
      console.log('Dialog opened, fetching tests for pack:', pack);
      fetchAvailableTests();
      fetchExistingTests();
    }
  }, [open, pack]);

  const fetchAvailableTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(
        `Fetching available tests for pack type: ${pack.pack_type}, exam ID: ${pack.exam_id}`
      );
      const response = await fetch(
        `/api/tests?packType=${encodeURIComponent(
          pack.pack_type
        )}&examId=${encodeURIComponent(pack.exam_id)}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch available tests: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log('Available tests:', data);
      setAvailableTests(data);
    } catch (error) {
      console.error('Error fetching available tests:', error);
      setError(error.message);
      toast.error(`Failed to fetch available tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingTests = async () => {
    setError(null);
    try {
      console.log(`Fetching existing tests for pack ID: ${pack.pack_id}`);
      const response = await fetch(
        `/api/pack-tests?packId=${encodeURIComponent(pack.pack_id)}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch existing tests: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log('Existing tests:', data);
      const existingTests = data.testIds.reduce((acc, testId) => {
        acc[testId] = true;
        return acc;
      }, {});
      setSelectedTests(existingTests);
    } catch (error) {
      console.error('Error fetching existing tests:', error);
      setError(error.message);
      toast.error(`Failed to fetch existing tests: ${error.message}`);
    }
  };

  const handleTestSelection = (testId) => {
    setSelectedTests((prev) => ({
      ...prev,
      [testId]: !prev[testId],
    }));
  };

  const handleUpdateTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const selectedTestIds = Object.entries(selectedTests)
        .filter(([_, isSelected]) => isSelected)
        .map(([testId]) => testId);

      console.log('Selected test IDs:', selectedTestIds);

      if (!pack.pack_id) {
        throw new Error('Pack ID is required');
      }

      const response = await fetch('/api/pack-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack.pack_id.toString(), // Ensure it's a string
          testIds: selectedTestIds.map((id) => id.toString()), // Ensure all IDs are strings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || 'Failed to update tests'
        );
      }

      const data = await response.json();
      console.log('Update successful:', data);

      toast.success('Tests updated successfully');
      onTestsUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating tests:', error);
      setError(error.message);
      toast.error(`Failed to update tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Tests for {pack?.pack_name}</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {availableTests.length === 0 ? (
              <div>No available tests found for this pack type.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Select</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Number of Questions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTests[test.id] || false}
                          onCheckedChange={() => handleTestSelection(test.id)}
                        />
                      </TableCell>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{test.num_questions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={handleUpdateTests} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Tests'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTestsDialog;
