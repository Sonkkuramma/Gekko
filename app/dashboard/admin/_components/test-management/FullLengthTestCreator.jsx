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

const FullLengthTestCreator = () => {
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
    if (!examId || !difficulty) {
      return;
    }

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
    fetchExams();
  }, [fetchExams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSectionTests.length !== parseInt(formData.numSections)) {
      toast.error(
        `Please select exactly ${formData.numSections} section tests.`
      );
      return;
    }

    try {
      const response = await fetch('/api/fulllengthtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, selectedSectionTests }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create full-length test');
      }

      const data = await response.json();
      toast.success(
        `Full-length test created successfully with ID: ${data.fullLengthTestId}`
      );

      // Reset form
      setFormData({
        testName: '',
        testSlug: '',
        numSections: '',
        difficulty: '',
        examId: '',
      });
      setSelectedSectionTests([]);
      setSectionTests([]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="testName">Full-Length Test Name</Label>
        <Input
          id="testName"
          name="testName"
          value={formData.testName}
          onChange={handleInputChange}
          placeholder="e.g. SAT Full-Length Test 1"
        />
      </div>

      <div>
        <Label htmlFor="testSlug">Full-Length Test Slug</Label>
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
        <Label htmlFor="numSections">Number of Section Tests</Label>
        <Input
          id="numSections"
          name="numSections"
          type="number"
          value={formData.numSections}
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

      {sectionTests.length > 0 && (
        <div>
          <Label>
            Select Section Tests ({selectedSectionTests.length} /{' '}
            {formData.numSections})
          </Label>
          <ScrollArea className="h-[400px] w-full border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Num Modules</TableHead>
                  <TableHead>Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionTests.map((sectionTest) => (
                  <TableRow key={sectionTest.section_test_id}>
                    <TableCell>{sectionTest.section_test_id}</TableCell>
                    <TableCell>{sectionTest.name}</TableCell>
                    <TableCell>{sectionTest.difficulty}</TableCell>
                    <TableCell>{sectionTest.num_modules}</TableCell>
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

      <Button type="submit">Create Full-Length Test</Button>
    </form>
  );
};

export default FullLengthTestCreator;
