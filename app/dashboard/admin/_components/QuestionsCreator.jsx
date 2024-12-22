// File: app/dashboard/admin/_components/QuestionsCreator.jsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import MultiSelect from './MultiSelect';

const QuestionsCreator = () => {
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_content: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: '',
    difficulty: '',
    exam_ids: [],
    section_ids: [],
    module_ids: [],
    topic_ids: [],
  });
  const [bulkFile, setBulkFile] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (newQuestion.exam_ids.length > 0) {
      fetchSections(newQuestion.exam_ids);
    } else {
      setSections([]);
    }
  }, [newQuestion.exam_ids]);

  useEffect(() => {
    if (newQuestion.section_ids.length > 0) {
      fetchModules(newQuestion.section_ids);
    } else {
      setModules([]);
    }
  }, [newQuestion.section_ids]);

  useEffect(() => {
    if (newQuestion.module_ids.length > 0) {
      fetchTopics(newQuestion.module_ids);
    } else {
      setTopics([]);
    }
  }, [newQuestion.module_ids]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/id/exam');
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      setExams(data);
    } catch (error) {
      toast.error('Failed to fetch exams');
    }
  };

  const fetchSections = async (examIds) => {
    try {
      const response = await fetch(
        `/api/id/section?examIds=${examIds.join(',')}`
      );
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  };

  const fetchModules = async (sectionIds) => {
    try {
      const response = await fetch(
        `/api/id/module?sectionIds=${sectionIds.join(',')}`
      );
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      setModules(data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    }
  };

  const fetchTopics = async (moduleIds) => {
    try {
      const response = await fetch(
        `/api/id/topic?moduleIds=${moduleIds.join(',')}`
      );
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      toast.error('Failed to fetch topics');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const handleMultiSelectChange = (name, selectedItems) => {
    setNewQuestion({ ...newQuestion, [name]: selectedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
      if (!response.ok) throw new Error('Failed to create question');
      const data = await response.json();
      toast.success(
        `Question created successfully with ID: ${data.questionId}`
      );
      setNewQuestion({
        question_content: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        explanation: '',
        difficulty: '',
        exam_ids: [],
        section_ids: [],
        module_ids: [],
        topic_ids: [],
      });
    } catch (error) {
      toast.error('Failed to create question');
    }
  };

  const handleFileChange = (e) => {
    setBulkFile(e.target.files[0]);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error('Please select a file to upload');
      return;
    }
    try {
      const fileContent = await bulkFile.text();
      const questions = JSON.parse(fileContent);
      const response = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload questions');
      }
      toast.success(`Successfully uploaded ${data.count} questions`);
      console.log('Inserted questions:', data.insertedQuestions);
      setBulkFile(null);
    } catch (error) {
      console.error('Error uploading questions:', error);
      toast.error(`Failed to upload questions: ${error.message}`);
    }
  };

  console.log('QuestionsCreator state:', newQuestion); // Debugging

  return (
    <div className="space-y-4">
      <Toaster />
      <h2 className="text-2xl font-bold">Create New Question</h2>

      <Tabs defaultValue="single" className="w-full">
        <TabsList>
          <TabsTrigger value="single">Single Question</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              name="question_content"
              placeholder="Enter Question Content"
              value={newQuestion.question_content}
              onChange={handleInputChange}
              rows={4}
            />

            <Input
              name="option_a"
              placeholder="Option A"
              value={newQuestion.option_a}
              onChange={handleInputChange}
            />
            <Input
              name="option_b"
              placeholder="Option B"
              value={newQuestion.option_b}
              onChange={handleInputChange}
            />
            <Input
              name="option_c"
              placeholder="Option C"
              value={newQuestion.option_c}
              onChange={handleInputChange}
            />
            <Input
              name="option_d"
              placeholder="Option D"
              value={newQuestion.option_d}
              onChange={handleInputChange}
            />

            <Select
              value={newQuestion.correct_answer}
              onValueChange={(value) =>
                handleSelectChange('correct_answer', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Correct Answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              name="explanation"
              placeholder="Explanation"
              value={newQuestion.explanation}
              onChange={handleInputChange}
              rows={4}
            />

            <Select
              value={newQuestion.difficulty}
              onValueChange={(value) => handleSelectChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <MultiSelect
              options={exams.map((exam) => ({
                label: exam.name,
                value: exam.exam_id,
              }))}
              selected={newQuestion.exam_ids}
              onChange={(selectedItems) =>
                handleMultiSelectChange('exam_ids', selectedItems)
              }
              placeholder="Select Exams"
            />

            <MultiSelect
              options={sections.map((section) => ({
                label: section.name,
                value: section.section_id,
              }))}
              selected={newQuestion.section_ids}
              onChange={(selectedItems) =>
                handleMultiSelectChange('section_ids', selectedItems)
              }
              placeholder="Select Sections"
              disabled={newQuestion.exam_ids.length === 0}
            />

            <MultiSelect
              options={modules.map((module) => ({
                label: module.name,
                value: module.module_id,
              }))}
              selected={newQuestion.module_ids}
              onChange={(selectedItems) =>
                handleMultiSelectChange('module_ids', selectedItems)
              }
              placeholder="Select Modules"
              disabled={newQuestion.section_ids.length === 0}
            />

            <MultiSelect
              options={topics.map((topic) => ({
                label: topic.name,
                value: topic.topic_id,
              }))}
              selected={newQuestion.topic_ids}
              onChange={(selectedItems) =>
                handleMultiSelectChange('topic_ids', selectedItems)
              }
              placeholder="Select Topics"
              disabled={newQuestion.module_ids.length === 0}
            />

            <Button type="submit">Create Question</Button>
          </form>
        </TabsContent>
        <TabsContent value="bulk">
          <div className="space-y-4">
            <p>
              Upload a JSON file containing an array of questions. Here's a
              sample question format:
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(
                {
                  question_content: 'What is the capital of France?',
                  option_a: 'London',
                  option_b: 'Berlin',
                  option_c: 'Paris',
                  option_d: 'Madrid',
                  correct_answer: 'C',
                  explanation:
                    'Paris is the capital and largest city of France.',
                  difficulty: 'Easy',
                  exam_ids: ['EXAM001', 'EXAM002'],
                  section_ids: ['SEC001', 'SEC002'],
                  module_ids: ['MOD001', 'MOD002'],
                  topic_ids: ['TOP001', 'TOP002'],
                },
                null,
                2
              )}
            </pre>
            <Input type="file" accept=".json" onChange={handleFileChange} />
            <Button onClick={handleBulkUpload}>Upload JSON</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionsCreator;
