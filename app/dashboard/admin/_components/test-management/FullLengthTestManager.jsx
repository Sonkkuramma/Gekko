// File: app/dashboard/admin/_components/FullLengthTestManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const FullLengthTestManager = () => {
  const [fullLengthTests, setFullLengthTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    testSlug: '',
    numSections: '',
    difficulty: '',
    examId: '',
  });
  const [sectionTests, setSectionTests] = useState([]);
  const [selectedSectionTests, setSelectedSectionTests] = useState([]);
  const [exams, setExams] = useState([]);

  const fetchFullLengthTests = useCallback(async () => {
    try {
      const response = await fetch('/api/fulllengthtests/manager');
      if (!response.ok) throw new Error('Failed to fetch full-length tests');
      const data = await response.json();
      setFullLengthTests(data);
    } catch (error) {
      toast.error('Failed to fetch full-length tests');
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      const response = await fetch('/api/id/exam');
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      setExams(data);
    } catch (error) {
      toast.error('Failed to fetch exams');
    }
  }, []);

  const fetchSectionTests = useCallback(async () => {
    const { examId, difficulty } = formData;
    if (!examId || !difficulty) return;

    const queryParams = new URLSearchParams({
      examId,
      difficulty,
    });

    try {
      const response = await fetch(`/api/fulllengthtests?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch section tests');
      const data = await response.json();
      setSectionTests(data.sectionTests);
    } catch (error) {
      toast.error('Failed to fetch section tests');
    }
  }, [formData]);

  useEffect(() => {
    fetchFullLengthTests();
    fetchExams();
  }, [fetchFullLengthTests, fetchExams]);

  useEffect(() => {
    fetchSectionTests();
  }, [fetchSectionTests]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'testName'
        ? { testSlug: value.toLowerCase().replace(/\s+/g, '-') }
        : {}),
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionTestSelection = (sectionTestId) => {
    setSelectedSectionTests((prev) =>
      prev.includes(sectionTestId)
        ? prev.filter((id) => id !== sectionTestId)
        : [...prev, sectionTestId]
    );
  };

  const handleEdit = async (fullLengthTest) => {
    setEditingTest(fullLengthTest);
    setFormData({
      testName: fullLengthTest.name,
      testSlug: fullLengthTest.slug,
      numSections: fullLengthTest.num_sections.toString(),
      difficulty: fullLengthTest.difficulty,
      examId: fullLengthTest.exam_id,
    });
    setSelectedSectionTests(fullLengthTest.section_test_ids);
    await fetchSectionTests();
  };

  const handleUpdate = async () => {
    if (selectedSectionTests.length !== parseInt(formData.numSections)) {
      toast.error(
        `Please select exactly ${formData.numSections} section tests.`
      );
      return;
    }

    try {
      const response = await fetch(`/api/fulllengthtests/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullLengthTestId: editingTest.fulllength_test_id,
          ...formData,
          selectedSectionTests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update full-length test');
      }

      toast.success('Full-length test updated successfully');
      setEditingTest(null);
      fetchFullLengthTests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (fullLengthTestId) => {
    try {
      const response = await fetch(
        `/api/fulllengthtests/manager?fullLengthTestId=${fullLengthTestId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete full-length test');
      }

      toast.success('Full-length test deleted successfully');
      fetchFullLengthTests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fullLengthTests.map((test) => (
            <TableRow key={test.fulllength_test_id}>
              <TableCell>{test.fulllength_test_id}</TableCell>
              <TableCell>{test.name}</TableCell>
              <TableCell>{test.difficulty}</TableCell>
              <TableCell>{test.num_sections}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleEdit(test)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Edit Full-Length Test</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="testName" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="testName"
                          name="testName"
                          value={formData.testName}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="testSlug" className="text-right">
                          Slug
                        </Label>
                        <Input
                          id="testSlug"
                          name="testSlug"
                          value={formData.testSlug}
                          onChange={handleInputChange}
                          className="col-span-3"
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="numSections" className="text-right">
                          Sections
                        </Label>
                        <Input
                          id="numSections"
                          name="numSections"
                          type="number"
                          value={formData.numSections}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Difficulty</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange('difficulty', value)
                          }
                          value={formData.difficulty}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Exam</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange('examId', value)
                          }
                          value={formData.examId}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {exams.map((exam) => (
                              <SelectItem
                                key={exam.exam_id}
                                value={exam.exam_id}
                              >
                                {exam.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {sectionTests.length > 0 && (
                      <div>
                        <Label>
                          Select Section Tests ({selectedSectionTests.length} /{' '}
                          {formData.numSections})
                        </Label>
                        <ScrollArea className="h-[300px] w-full border rounded">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Modules</TableHead>
                                <TableHead>Select</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sectionTests.map((sectionTest) => (
                                <TableRow key={sectionTest.section_test_id}>
                                  <TableCell>
                                    {sectionTest.section_test_id}
                                  </TableCell>
                                  <TableCell>{sectionTest.name}</TableCell>
                                  <TableCell>
                                    {sectionTest.difficulty}
                                  </TableCell>
                                  <TableCell>
                                    {sectionTest.num_modules}
                                  </TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedSectionTests.includes(
                                        sectionTest.section_test_id
                                      )}
                                      onCheckedChange={() =>
                                        handleSectionTestSelection(
                                          sectionTest.section_test_id
                                        )
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    )}
                    <Button onClick={handleUpdate}>
                      Update Full-Length Test
                    </Button>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="ml-2">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the full-length test.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(test.fulllength_test_id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FullLengthTestManager;
