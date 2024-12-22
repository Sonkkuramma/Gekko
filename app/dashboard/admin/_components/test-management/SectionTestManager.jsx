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

const SectionTestManager = () => {
  const [sectionTests, setSectionTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    testSlug: '',
    numModules: '',
    difficulty: '',
    examId: '',
    sectionId: '',
  });
  const [moduleTests, setModuleTests] = useState([]);
  const [selectedModuleTests, setSelectedModuleTests] = useState([]);
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);

  const fetchSectionTests = useCallback(async () => {
    try {
      const response = await fetch('/api/sectiontests/manager');
      if (!response.ok) throw new Error('Failed to fetch section tests');
      const data = await response.json();
      setSectionTests(data);
    } catch (error) {
      toast.error('Failed to fetch section tests');
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

  const fetchSections = useCallback(async (examId) => {
    if (!examId) return;
    try {
      const response = await fetch(`/api/id/section?examIds=${examId}`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  }, []);

  const fetchModuleTests = useCallback(async () => {
    const { examId, sectionId, difficulty } = formData;
    if (!examId || !sectionId || !difficulty) return;

    const queryParams = new URLSearchParams({
      examId,
      sectionId,
      difficulty,
    });

    try {
      const response = await fetch(`/api/sectiontests?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch module tests');
      const data = await response.json();
      setModuleTests(data.moduleTests);
    } catch (error) {
      toast.error('Failed to fetch module tests');
    }
  }, [formData]);

  useEffect(() => {
    fetchSectionTests();
    fetchExams();
  }, [fetchSectionTests, fetchExams]);

  useEffect(() => {
    fetchSections(formData.examId);
  }, [formData.examId, fetchSections]);

  useEffect(() => {
    fetchModuleTests();
  }, [fetchModuleTests]);

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

  const handleModuleTestSelection = (moduleTestId) => {
    setSelectedModuleTests((prev) =>
      prev.includes(moduleTestId)
        ? prev.filter((id) => id !== moduleTestId)
        : [...prev, moduleTestId]
    );
  };

  const handleEdit = async (sectionTest) => {
    setEditingTest(sectionTest);
    setFormData({
      testName: sectionTest.name,
      testSlug: sectionTest.slug,
      numModules: sectionTest.num_modules.toString(),
      difficulty: sectionTest.difficulty,
      examId: sectionTest.exam_id,
      sectionId: sectionTest.section_id,
    });
    setSelectedModuleTests(sectionTest.module_test_ids);
    await fetchSections(sectionTest.exam_id);
    await fetchModuleTests();
  };

  const handleUpdate = async () => {
    if (selectedModuleTests.length !== parseInt(formData.numModules)) {
      toast.error(`Please select exactly ${formData.numModules} module tests.`);
      return;
    }

    try {
      const response = await fetch(`/api/sectiontests/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTestId: editingTest.section_test_id,
          ...formData,
          selectedModuleTests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update section test');
      }

      toast.success('Section test updated successfully');
      setEditingTest(null);
      fetchSectionTests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (sectionTestId) => {
    try {
      const response = await fetch(
        `/api/sectiontests/manager?sectionTestId=${sectionTestId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete section test');
      }

      toast.success('Section test deleted successfully');
      fetchSectionTests();
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
            <TableHead>Modules</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectionTests.map((test) => (
            <TableRow key={test.section_test_id}>
              <TableCell>{test.section_test_id}</TableCell>
              <TableCell>{test.name}</TableCell>
              <TableCell>{test.difficulty}</TableCell>
              <TableCell>{test.num_modules}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleEdit(test)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Edit Section Test</DialogTitle>
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
                        <Label htmlFor="numModules" className="text-right">
                          Modules
                        </Label>
                        <Input
                          id="numModules"
                          name="numModules"
                          type="number"
                          value={formData.numModules}
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Section</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange('sectionId', value)
                          }
                          value={formData.sectionId}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((section) => (
                              <SelectItem
                                key={section.section_id}
                                value={section.section_id}
                              >
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {moduleTests.length > 0 && (
                      <div>
                        <Label>
                          Select Module Tests ({selectedModuleTests.length} /{' '}
                          {formData.numModules})
                        </Label>
                        <ScrollArea className="h-[300px] w-full border rounded">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Select</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {moduleTests.map((moduleTest) => (
                                <TableRow key={moduleTest.module_test_id}>
                                  <TableCell>
                                    {moduleTest.module_test_id}
                                  </TableCell>
                                  <TableCell>{moduleTest.name}</TableCell>
                                  <TableCell>{moduleTest.difficulty}</TableCell>
                                  <TableCell>
                                    {moduleTest.num_questions}
                                  </TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedModuleTests.includes(
                                        moduleTest.module_test_id
                                      )}
                                      onCheckedChange={() =>
                                        handleModuleTestSelection(
                                          moduleTest.module_test_id
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
                    <Button onClick={handleUpdate}>Update Section Test</Button>
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
                        delete the section test.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(test.section_test_id)}
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

export default SectionTestManager;
