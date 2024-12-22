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

const ModuleTestCreator = () => {
  const [formData, setFormData] = useState({
    testName: '',
    testSlug: '',
    numQuestions: '',
    duration_minutes: '45', // Add default duration
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
    fetchExams();
  }, [fetchExams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedQuestions.length !== parseInt(formData.numQuestions)) {
      toast.error(`Please select exactly ${formData.numQuestions} questions.`);
      return;
    }

    try {
      const response = await fetch('/api/moduletests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, selectedQuestions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create module test');
      }

      const data = await response.json();
      toast.success(
        `Module test created successfully with ID: ${data.moduleTestId}`
      );

      // Reset form
      setFormData({
        testName: '',
        testSlug: '',
        numQuestions: '',
        difficulty: '',
        examId: '',
        sectionId: '',
        moduleId: '',
      });
      setSelectedQuestions([]);
      setQuestions([]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="testName">Module Test Name</Label>
        <Input
          id="testName"
          name="testName"
          value={formData.testName}
          onChange={handleInputChange}
          placeholder="e.g. Algebra Basics"
        />
      </div>

      <div>
        <Label htmlFor="testSlug">Module Test Slug</Label>
        <Input
          id="testSlug"
          name="testSlug"
          value={formData.testSlug}
          onChange={handleInputChange}
          placeholder="Auto-generated based on name"
          disabled
        />
      </div>

      <div>
        <Label htmlFor="numQuestions">Number of Questions</Label>
        <Input
          id="numQuestions"
          name="numQuestions"
          type="number"
          value={formData.numQuestions}
          onChange={handleInputChange}
          min="1"
        />
      </div>

      <div>
        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
        <Input
          id="duration_minutes"
          name="duration_minutes"
          type="number"
          value={formData.duration_minutes}
          onChange={handleInputChange}
          min="1"
          max="180"
          placeholder="Test duration in minutes"
        />
      </div>

      <div>
        <Label>Difficulty</Label>
        <Select
          onValueChange={(value) => handleSelectChange('difficulty', value)}
          value={formData.difficulty}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Exam</Label>
        <Select
          onValueChange={(value) => handleSelectChange('examId', value)}
          value={formData.examId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.exam_id} value={exam.exam_id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Section</Label>
        <Select
          onValueChange={(value) => handleSelectChange('sectionId', value)}
          value={formData.sectionId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.section_id} value={section.section_id}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Module</Label>
        <Select
          onValueChange={(value) => handleSelectChange('moduleId', value)}
          value={formData.moduleId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module.module_id} value={module.module_id}>
                {module.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {questions.length > 0 && (
        <div>
          <Label>
            Select Questions ({selectedQuestions.length} /{' '}
            {formData.numQuestions})
          </Label>
          <ScrollArea className="h-[400px] w-full border rounded">
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
                          handleQuestionSelection(question.question_id)
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

      <Button type="submit">Create Module Test</Button>
    </form>
  );
};

export default ModuleTestCreator;
