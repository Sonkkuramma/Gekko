import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const CreateBundleForm = ({
  isOpen,
  onClose,
  testPacks,
  existingBundles,
  onCreateBundle,
  tags,
}) => {
  const [bundleName, setBundleName] = useState('');
  const [bundleSlug, setBundleSlug] = useState('');
  const [description, setDescription] = useState('');
  const [exam, setExam] = useState('');
  const [selectedTestPacks, setSelectedTestPacks] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newBundleId, setNewBundleId] = useState(0);

  useEffect(() => {
    if (existingBundles.length > 0) {
      const maxId = Math.max(...existingBundles.map((bundle) => bundle.id));
      setNewBundleId(maxId + 1);
    } else {
      setNewBundleId(1);
    }
  }, [existingBundles]);

  useEffect(() => {
    setBundleSlug(bundleName.toLowerCase().replace(/\s+/g, '-'));
  }, [bundleName]);

  const handleTestPackChange = (testPackId) => {
    setSelectedTestPacks((prev) => {
      if (prev.includes(testPackId)) {
        return prev.filter((id) => id !== testPackId);
      } else {
        return [...prev, testPackId];
      }
    });
  };

  const handleTagChange = (tagId) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    const newBundle = {
      id: newBundleId,
      exam,
      bundle_name: bundleName,
      bundle_slug: bundleSlug,
      description,
      image_url: `@public/${bundleSlug}.png`,
      image_alt: bundleName,
      testPacks: selectedTestPacks,
      tags: selectedTags,
    };
    onCreateBundle(newBundle);
    onClose();
  };

  const uniqueExams = [...new Set(testPacks.map((pack) => pack.exam))];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Bundle</DialogTitle>
        </DialogHeader>
        {!showConfirmation ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bundleName" className="text-right">
                Bundle Name
              </Label>
              <Input
                id="bundleName"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bundleSlug" className="text-right">
                Bundle Slug
              </Label>
              <Input
                id="bundleSlug"
                value={bundleSlug}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exam" className="text-right">
                Exam
              </Label>
              <Select onValueChange={setExam} value={exam}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueExams.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Test Packs</Label>
              <Select
                onValueChange={(value) => handleTestPackChange(Number(value))}
                value=""
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select test packs" />
                </SelectTrigger>
                <SelectContent>
                  {testPacks.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id.toString()}>
                      {pack.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex flex-wrap gap-2">
                {selectedTestPacks.map((packId) => {
                  const pack = testPacks.find((p) => p.id === packId);
                  return (
                    <Badge key={packId} variant="secondary">
                      {pack.title}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0"
                        onClick={() => handleTestPackChange(packId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tags</Label>
              <Select
                onValueChange={(value) => handleTagChange(Number(value))}
                value=""
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select tags" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.tag_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return (
                    <Badge key={tagId} variant="secondary">
                      {tag.tag_name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0"
                        onClick={() => handleTagChange(tagId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertTitle>Confirm Bundle Creation</AlertTitle>
            <AlertDescription>
              <p>Bundle Name: {bundleName}</p>
              <p>Bundle Slug: {bundleSlug}</p>
              <p>Exam: {exam}</p>
              <p>Description: {description}</p>
              <p>Image: /{bundleSlug}.png</p>
              <p>Selected Test Packs: {selectedTestPacks.join(', ')}</p>
              <p>Selected Tags: {selectedTags.join(', ')}</p>
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          {!showConfirmation ? (
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Back
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBundleForm;
