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

const TopicTestManager = () => {
  const [topicTests, setTopicTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    testSlug: '',
    numQuestions: '',
    difficulty: '',
    examId: '',
    sectionId: '',
    moduleId: '',
    topicId: '',
  });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);

  const fetchTopicTests = useCallback(async () => {
    try {
      const response = await fetch('/api/topictests/manager');
      if (!response.ok) throw new Error('Failed to fetch topic tests');
      const data = await response.json();
      setTopicTests(data);
    } catch (error) {
      toast.error('Failed to fetch topic tests');
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

  const fetchTopics = useCallback(async (moduleId) => {
    if (!moduleId) return;
    try {
      const response = await fetch(`/api/id/topic?moduleIds=${moduleId}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      toast.error('Failed to fetch topics');
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    const { examId, sectionId, moduleId, topicId, difficulty } = formData;
    if (!examId || !sectionId || !moduleId || !topicId || !difficulty) {
      return;
    }

    const queryParams = new URLSearchParams({
      examIds: examId,
      sectionIds: sectionId,
      moduleIds: moduleId,
      topicIds: topicId,
      difficulties: difficulty,
    });

    try {
      const response = await fetch(`/api/topictests?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      toast.error('Failed to fetch questions');
    }
  }, [formData]);

  useEffect(() => {
    fetchTopicTests();
    fetchExams();
  }, [fetchTopicTests, fetchExams]);

  useEffect(() => {
    fetchSections(formData.examId);
  }, [formData.examId, fetchSections]);

  useEffect(() => {
    fetchModules(formData.sectionId);
  }, [formData.sectionId, fetchModules]);

  useEffect(() => {
    fetchTopics(formData.moduleId);
  }, [formData.moduleId, fetchTopics]);

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

  const handleEdit = async (topicTest) => {
    setEditingTest(topicTest);
    setFormData({
      testName: topicTest.name,
      testSlug: topicTest.slug,
      numQuestions: topicTest.num_questions.toString(),
      difficulty: topicTest.difficulty,
      examId: topicTest.exam_id,
      sectionId: topicTest.section_id,
      moduleId: topicTest.module_id,
      topicId: topicTest.topic_id,
    });
    setSelectedQuestions(topicTest.question_ids);
    await fetchSections(topicTest.exam_id);
    await fetchModules(topicTest.section_id);
    await fetchTopics(topicTest.module_id);
    await fetchQuestions();
  };

  const handleUpdate = async () => {
    if (selectedQuestions.length !== parseInt(formData.numQuestions)) {
      toast.error(`Please select exactly ${formData.numQuestions} questions.`);
      return;
    }

    try {
      const response = await fetch(`/api/topictests/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTestId: editingTest.topic_test_id,
          ...formData,
          selectedQuestions,
        }),
      });

      const responseData = await response.json();
      console.log('Response:', response.status, responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update topic test');
      }

      toast.success('Topic test updated successfully');
      setEditingTest(null);
      fetchTopicTests();
    } catch (error) {
      console.error('Error updating topic test:', error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (topicTestId) => {
    try {
      const response = await fetch(
        `/api/topictests/manager?topicTestId=${topicTestId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete topic test');
      }

      toast.success('Topic test deleted successfully');
      fetchTopicTests();
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
            <TableHead>Duration (min)</TableHead> {/* Add this line */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topicTests.map((test) => (
            <TableRow key={test.topic_test_id}>
              <TableCell>{test.topic_test_id}</TableCell>
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
                      <DialogTitle>Edit Topic Test</DialogTitle>
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Topic</Label>
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange('topicId', value)
                          }
                          value={formData.topicId}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics.map((topic) => (
                              <SelectItem
                                key={topic.topic_id}
                                value={topic.topic_id}
                              >
                                {topic.name}
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration_minutes" className="text-right">
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
                    <Button onClick={handleUpdate}>Update Topic Test</Button>
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
                        delete the topic test.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(test.topic_test_id)}
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

export default TopicTestManager;
