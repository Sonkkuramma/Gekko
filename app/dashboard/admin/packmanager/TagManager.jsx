import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const TagManager = () => {
  const [testPacks, setTestPacks] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [openDialog, setOpenDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          packsResponse,
          bundlesResponse,
          tagsResponse,
          testPackTagsResponse,
          bundleTagsResponse,
        ] = await Promise.all([
          fetch('/api/testpacks'),
          fetch('/api/bundles'),
          fetch('/api/tags'),
          fetch('/api/testPackTags'),
          fetch('/api/bundleTags'),
        ]);

        if (!packsResponse.ok) throw new Error('Failed to fetch test packs');
        if (!bundlesResponse.ok) throw new Error('Failed to fetch bundles');
        if (!tagsResponse.ok) throw new Error('Failed to fetch tags');
        if (!testPackTagsResponse.ok)
          throw new Error('Failed to fetch test pack tags');
        if (!bundleTagsResponse.ok)
          throw new Error('Failed to fetch bundle tags');

        const [packsData, bundlesData, tagsData, testPackTags, bundleTags] =
          await Promise.all([
            packsResponse.json(),
            bundlesResponse.json(),
            tagsResponse.json(),
            testPackTagsResponse.json(),
            bundleTagsResponse.json(),
          ]);

        setTestPacks(packsData);
        setBundles(bundlesData);
        setAvailableTags(tagsData);

        // Initialize selectedTags with existing tags for each item
        const initialSelectedTags = {};
        testPackTags.forEach(({ test_pack_id, tag_id }) => {
          if (!initialSelectedTags[test_pack_id])
            initialSelectedTags[test_pack_id] = [];
          initialSelectedTags[test_pack_id].push(tag_id.toString());
        });
        bundleTags.forEach(({ bundle_id, tag_id }) => {
          if (!initialSelectedTags[bundle_id])
            initialSelectedTags[bundle_id] = [];
          initialSelectedTags[bundle_id].push(tag_id.toString());
        });
        setSelectedTags(initialSelectedTags);

        console.log('Initial selected tags:', initialSelectedTags);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleManageTags = (id, type) => {
    console.log('Managing tags for:', id, 'Type:', type);
    console.log('Current tags:', selectedTags[id]);
    setOpenDialog({ id, type });
  };

  const handleTagSelection = (tagId) => {
    setSelectedTags((prevState) => {
      const newState = {
        ...prevState,
        [openDialog.id]: prevState[openDialog.id]?.includes(tagId)
          ? prevState[openDialog.id].filter((id) => id !== tagId)
          : [...(prevState[openDialog.id] || []), tagId],
      };
      console.log('Updated selected tags:', newState);
      return newState;
    });
  };

  const handleSaveTags = async () => {
    console.log(
      'Saving tags for:',
      openDialog.id,
      'Tags:',
      selectedTags[openDialog.id]
    );
    try {
      const response = await fetch(`/api/updateTags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: openDialog.id,
          type: openDialog.type,
          tags: selectedTags[openDialog.id],
        }),
      });
      if (!response.ok) throw new Error('Failed to update tags');
      const updatedData = await response.json();
      console.log('Response from updateTags:', updatedData);

      // Update local state
      if (openDialog.type === 'pack') {
        setTestPacks((prevPacks) =>
          prevPacks.map((pack) =>
            pack.pack_id === openDialog.id
              ? { ...pack, tags: updatedData.tags }
              : pack
          )
        );
      } else {
        setBundles((prevBundles) =>
          prevBundles.map((bundle) =>
            bundle.bundle_id === openDialog.id
              ? { ...bundle, tags: updatedData.tags }
              : bundle
          )
        );
      }
      setOpenDialog(null);
    } catch (error) {
      console.error('Error saving tags:', error);
      setError('Failed to save tags. Please try again.');
    }
  };

  const getTagNames = (tagIds) => {
    console.log('Getting tag names for:', tagIds);
    return tagIds
      .map((id) => {
        const tag = availableTags.find(
          (tag) => tag.tag_id.toString() === id.toString()
        );
        console.log('Found tag:', tag);
        return tag?.tag_name;
      })
      .filter(Boolean)
      .join(', ');
  };

  const renderTable = (items, type) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {type === 'pack' ? 'Test Pack ID' : 'Bundle ID'}
          </TableHead>
          <TableHead>
            {type === 'pack' ? 'Test Pack Name' : 'Bundle Name'}
          </TableHead>
          <TableHead>Added Tags</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const itemId = type === 'pack' ? item.pack_id : item.bundle_id;
          const itemTags = selectedTags[itemId] || [];
          console.log('Rendering item:', itemId, 'Tags:', itemTags);
          return (
            <TableRow key={itemId}>
              <TableCell>{itemId}</TableCell>
              <TableCell>
                {type === 'pack' ? item.pack_name : item.bundle_name}
              </TableCell>
              <TableCell>{getTagNames(itemTags)}</TableCell>
              <TableCell>
                <Dialog
                  open={openDialog?.id === itemId}
                  onOpenChange={(open) => !open && setOpenDialog(null)}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => handleManageTags(itemId, type)}>
                      Manage Tags
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Manage Tags for{' '}
                        {type === 'pack' ? item.pack_name : item.bundle_name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4">
                      {availableTags.map((tag) => (
                        <div
                          key={tag.tag_id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`tag-${tag.tag_id}`}
                            checked={itemTags.includes(tag.tag_id.toString())}
                            onCheckedChange={() =>
                              handleTagSelection(tag.tag_id.toString())
                            }
                          />
                          <label htmlFor={`tag-${tag.tag_id}`}>
                            {tag.tag_name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleSaveTags}>Save Tags</Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Test Packs</h2>
      {renderTable(testPacks, 'pack')}

      <h2 className="text-2xl font-bold">Bundles</h2>
      {renderTable(bundles, 'bundle')}
    </div>
  );
};

export default TagManager;
