'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TagIdManager = () => {
  const [tagName, setTagName] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError(error.message);
    }
  };

  const handleAddTag = async () => {
    if (tagName.trim()) {
      try {
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagName: tagName.trim() }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add tag');
        }
        const newTag = await response.json();
        setTags((prevTags) => [...prevTags, newTag]);
        setTagName('');
        setError('');
      } catch (error) {
        console.error('Error adding tag:', error);
        setError(error.message);
      }
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const response = await fetch(`/api/tags?tagId=${tagId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tag');
      }
      setTags((prevTags) => prevTags.filter((tag) => tag.tag_id !== tagId));
      setError('');
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tag Management</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex space-x-2">
        <Input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Enter tag name"
        />
        <Button onClick={handleAddTag}>Add Tag</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">tag_id</TableHead>
            <TableHead>tag_name</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.tag_id}>
              <TableCell>{tag.tag_id.toString().padStart(4, '0')}</TableCell>
              <TableCell>{tag.tag_name}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTag(tag.tag_id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TagIdManager;
