'use client';

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

const ModuleTestManager = () => {
  const [moduleTests, setModuleTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    testSlug: '',
    numQuestions: '',
    duration_minutes: '',
    difficulty: '',
    examId: '',
    sectionId: '',
    moduleId: '',
  });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);

  const fetchModuleTests = useCallback(async () => {
    try {
      const response = await fetch('/api/moduletests/manager');
      if (!response.ok) throw new Error('Failed to fetch module tests');
      const data = await response.json();
      setModuleTests(data);
    } catch (error) {
      toast.error('Failed to fetch module tests');
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

  const fetchModules = useCallback(async (sectionId) => {
    if (!sectionId) return;
    try {
      const response = await fetch(`/api/id/module?sectionIds=${sectionId}`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      setModules(data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    const { examId, sectionId, moduleId, difficulty } = formData;
    if (!examId || !sectionId || !moduleId || !difficulty) {
      return;
    }

    const queryParams = new URLSearchParams({
      examIds: examId,
      sectionIds: sectionId,
      moduleIds: moduleId,
      difficulties: difficulty,
    });

    try {
      const response = await fetch(`/api/moduletests?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      toast.error('Failed to fetch questions');
    }
  }, [formData]);

  useEffect(() => {
    fetchModuleTests();
    fetchExams();
  }, [fetchModuleTests, fetchExams]);

  useEffect(() => {
    fetchSections(formData.examId);
  }, [formData.examId, fetchSections]);

  useEffect(() => {
    fetchModules(formData.sectionId);
  }, [formData.sectionId, fetchModules]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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

  const handleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleEdit = async (moduleTest) => {
    setEditingTest(moduleTest);
    setFormData({
      testName: moduleTest.name,
      testSlug: moduleTest.slug,
      numQuestions: moduleTest.num_questions.toString(),
      duration_minutes: moduleTest.duration_minutes.toString(),
      difficulty: moduleTest.difficulty,
      examId: moduleTest.exam_id,
      sectionId: moduleTest.section_id,
      moduleId: moduleTest.module_id,
    });
    setSelectedQuestions(moduleTest.question_ids);
    await fetchSections(moduleTest.exam_id);
    await fetchModules(moduleTest.section_id);
    await fetchQuestions();
  };

  const handleUpdate = async () => {
    if (selectedQuestions.length !== parseInt(formData.numQuestions)) {
      toast.error(`Please select exactly ${formData.numQuestions} questions.`);
      return;
    }

    if (
      !formData.duration_minutes ||
      formData.duration_minutes < 1 ||
      formData.duration_minutes > 180
    ) {
      toast.error('Duration must be between 1 and 180 minutes.');
      return;
    }

    try {
      const response = await fetch(`/api/moduletests/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleTestId: editingTest.module_test_id,
          ...formData,
          selectedQuestions,
        }),
      });

      const responseData = await response.json();
      console.log('Response:', response.status, responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update module test');
      }

      toast.success('Module test updated successfully');
      setEditingTest(null);
      fetchModuleTests();
    } catch (error) {
      console.error('Error updating module test:', error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (moduleTestId) => {
    try {
      const response = await fetch(
        `/api/moduletests/manager?moduleTestId=${moduleTestId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete module test');
      }

      toast.success('Module test deleted successfully');
      fetchModuleTests();
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
            <TableHead>Questions</TableHead>
            <TableHead>Duration (min)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moduleTests.map((test) => (
            <TableRow key={test.module_test_id}>
              <TableCell>{test.module_test_id}</TableCell>
              <TableCell>{test.name}</TableCell>
              <TableCell>{test.difficulty}</TableCell>
              <TableCell>{test.num_questions}</TableCell>
              <TableCell>{test.duration_minutes}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleEdit(test)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Edit Module Test</DialogTitle>
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
                        <Label htmlFor="numQuestions" className="text-right">
                          Questions
                        </Label>
                        <Input
                          id="numQuestions"
                          name="numQuestions"
                          type="number"
                          value={formData.numQuestions}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="duration_minutes"
                          className="text-right"
                        >
                          Duration (min)
                        </Label>
                        <Input
                          id="duration_minutes"
                          name="duration_minutes"
                          type="number"
                          value={formData.duration_minutes}
                          onChange={handleInputChange}
                          className="col-span-3"
                          min="1"
                          max="180"
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Module</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange('moduleId', value)
                          }
                          value={formData.moduleId}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map((module) => (
                              <SelectItem
                                key={module.module_id}
                                value={module.module_id}
                              >
                                {module.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {questions.length > 0 && (
                      <div>
                        <Label>
                          Select Questions ({selectedQuestions.length} /{' '}
                          {formData.numQuestions})
                        </Label>
                        <ScrollArea className="h-[300px] w-full border rounded">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Content (Question)</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Select</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {questions.map((question) => (
                                <TableRow key={question.question_id}>
                                  <TableCell>{question.question_id}</TableCell>
                                  <TableCell>{question.content}</TableCell>
                                  <TableCell>{question.difficulty}</TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedQuestions.includes(
                                        question.question_id
                                      )}
                                      onCheckedChange={() =>
                                        handleQuestionSelection(
                                          question.question_id
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
                    <Button onClick={handleUpdate}>Update Module Test</Button>
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
                        delete the module test.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(test.module_test_id)}
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

export default ModuleTestManager;
