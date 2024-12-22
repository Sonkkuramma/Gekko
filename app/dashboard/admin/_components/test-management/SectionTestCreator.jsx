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

const SectionTestCreator = () => {
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
    if (!examId || !sectionId || !difficulty) {
      return;
    }

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
    fetchExams();
  }, [fetchExams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedModuleTests.length !== parseInt(formData.numModules)) {
      toast.error(`Please select exactly ${formData.numModules} module tests.`);
      return;
    }

    try {
      const response = await fetch('/api/sectiontests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, selectedModuleTests }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create section test');
      }

      const data = await response.json();
      toast.success(
        `Section test created successfully with ID: ${data.sectionTestId}`
      );

      // Reset form
      setFormData({
        testName: '',
        testSlug: '',
        numModules: '',
        difficulty: '',
        examId: '',
        sectionId: '',
      });
      setSelectedModuleTests([]);
      setModuleTests([]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="testName">Section Test Name</Label>
        <Input
          id="testName"
          name="testName"
          value={formData.testName}
          onChange={handleInputChange}
          placeholder="e.g. Math Section Test 1"
        />
      </div>

      <div>
        <Label htmlFor="testSlug">Section Test Slug</Label>
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
        <Label htmlFor="numModules">Number of Module Tests</Label>
        <Input
          id="numModules"
          name="numModules"
          type="number"
          value={formData.numModules}
          onChange={handleInputChange}
          min="1"
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

      {moduleTests.length > 0 && (
        <div>
          <Label>
            Select Module Tests ({selectedModuleTests.length} /{' '}
            {formData.numModules})
          </Label>
          <ScrollArea className="h-[400px] w-full border rounded">
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
                    <TableCell>{moduleTest.module_test_id}</TableCell>
                    <TableCell>{moduleTest.name}</TableCell>
                    <TableCell>{moduleTest.difficulty}</TableCell>
                    <TableCell>{moduleTest.num_questions}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={selectedModuleTests.includes(
                          moduleTest.module_test_id
                        )}
                        onCheckedChange={() =>
                          handleModuleTestSelection(moduleTest.module_test_id)
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

      <Button type="submit">Create Section Test</Button>
    </form>
  );
};

export default SectionTestCreator;
