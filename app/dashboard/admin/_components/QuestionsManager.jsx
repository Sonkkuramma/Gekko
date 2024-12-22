import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const QuestionsManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchQuestions();
    fetchExams();
    fetchSections();
    fetchModules();
    fetchTopics();
  }, [currentPage]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/questions?page=${currentPage}&limit=10`
      );
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch questions');
      setError(true);
      setLoading(false);
    }
  };

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

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/id/section');
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/id/module');
      if (!response.ok) throw new Error('Failed to fetch modules');
      const data = await response.json();
      setModules(data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/id/topic');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      toast.error('Failed to fetch topics');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?'))
      return;

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete question');
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const openEditDialog = (question) => {
    setCurrentQuestion(question);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setCurrentQuestion(null);
    setIsEditDialogOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/questions/${currentQuestion.question_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentQuestion),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Question not found. The ID might be incorrect.');
        }
        throw new Error('Failed to update question');
      }

      toast.success('Question updated successfully');
      fetchQuestions();
      closeEditDialog();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error(`Failed to update question: ${error.message}`);
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const renderQuestionList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border text-sm">
        <thead>
          <tr>
            <th className="py-2 px-4 border">ID</th>
            <th className="py-2 px-4 border">Content (Question)</th>
            <th className="py-2 px-4 border">Difficulty</th>
            <th className="py-2 px-4 border">Exams</th>
            <th className="py-2 px-4 border">Sections</th>
            <th className="py-2 px-4 border">Modules</th>
            <th className="py-2 px-4 border">Topics</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.question_id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border text-center">
                {question.question_id}
              </td>
              <td className="py-2 px-4 border">
                {truncateText(question.question_content, 25)}
              </td>
              <td className="py-2 px-4 border text-center">
                {question.difficulty}
              </td>
              <td className="py-2 px-4 border text-center">
                {question.exam_ids.join(', ')}
              </td>
              <td className="py-2 px-4 border text-center">
                {question.section_ids.join(', ')}
              </td>
              <td className="py-2 px-4 border text-center">
                {question.module_ids.join(', ')}
              </td>
              <td className="py-2 px-4 border text-center">
                {question.topic_ids.join(', ')}
              </td>
              <td className="py-2 px-4 border text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditDialog(question)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(question.question_id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-between items-center mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                onClick={() => setCurrentPage(index + 1)}
                isActive={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className={
                currentPage === totalPages
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Button onClick={handleDownload} className="flex items-center gap-2">
        <Download size={16} />
        Download Questions
      </Button>
    </div>
  );

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/questions/download');
      if (!response.ok) throw new Error('Failed to download questions');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'questions.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Questions downloaded successfully');
    } catch (error) {
      console.error('Error downloading questions:', error);
      toast.error('Failed to download questions');
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((item) => item !== value)
        : [...prev[name], value],
    }));
  };

  const renderEditDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        {currentQuestion && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Textarea
              name="question_content"
              placeholder="Enter Question Content"
              value={currentQuestion.question_content}
              onChange={handleEditChange}
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="option_a"
                placeholder="Option A"
                value={currentQuestion.option_a}
                onChange={handleEditChange}
              />
              <Input
                name="option_b"
                placeholder="Option B"
                value={currentQuestion.option_b}
                onChange={handleEditChange}
              />
              <Input
                name="option_c"
                placeholder="Option C"
                value={currentQuestion.option_c}
                onChange={handleEditChange}
              />
              <Input
                name="option_d"
                placeholder="Option D"
                value={currentQuestion.option_d}
                onChange={handleEditChange}
              />
            </div>
            <Select
              value={currentQuestion.correct_answer}
              onValueChange={(value) =>
                setCurrentQuestion((prev) => ({
                  ...prev,
                  correct_answer: value,
                }))
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
              value={currentQuestion.explanation}
              onChange={handleEditChange}
              rows={4}
            />
            <Select
              value={currentQuestion.difficulty}
              onValueChange={(value) =>
                setCurrentQuestion((prev) => ({ ...prev, difficulty: value }))
              }
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2">Select Exams</h3>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {exams.map((exam) => (
                        <div
                          key={exam.exam_id}
                          className="flex items-center space-x-2 p-2"
                        >
                          <Checkbox
                            id={`exam-${exam.exam_id}`}
                            checked={currentQuestion.exam_ids.includes(
                              exam.exam_id
                            )}
                            onCheckedChange={() =>
                              handleMultiSelectChange('exam_ids', exam.exam_id)
                            }
                          />
                          <label htmlFor={`exam-${exam.exam_id}`}>
                            {exam.name}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h3 className="mb-2">Select Sections</h3>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {sections.map((section) => (
                        <div
                          key={section.section_id}
                          className="flex items-center space-x-2 p-2"
                        >
                          <Checkbox
                            id={`section-${section.section_id}`}
                            checked={currentQuestion.section_ids.includes(
                              section.section_id
                            )}
                            onCheckedChange={() =>
                              handleMultiSelectChange(
                                'section_ids',
                                section.section_id
                              )
                            }
                          />
                          <label htmlFor={`section-${section.section_id}`}>
                            {section.name}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2">Select Modules</h3>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {modules.map((module) => (
                        <div
                          key={module.module_id}
                          className="flex items-center space-x-2 p-2"
                        >
                          <Checkbox
                            id={`module-${module.module_id}`}
                            checked={currentQuestion.module_ids.includes(
                              module.module_id
                            )}
                            onCheckedChange={() =>
                              handleMultiSelectChange(
                                'module_ids',
                                module.module_id
                              )
                            }
                          />
                          <label htmlFor={`module-${module.module_id}`}>
                            {module.name}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h3 className="mb-2">Select Topics</h3>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {topics.map((topic) => (
                        <div
                          key={topic.topic_id}
                          className="flex items-center space-x-2 p-2"
                        >
                          <Checkbox
                            id={`topic-${topic.topic_id}`}
                            checked={currentQuestion.topic_ids.includes(
                              topic.topic_id
                            )}
                            onCheckedChange={() =>
                              handleMultiSelectChange(
                                'topic_ids',
                                topic.topic_id
                              )
                            }
                          />
                          <label htmlFor={`topic-${topic.topic_id}`}>
                            {topic.name}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>Error loading questions.</p>;

  return (
    <div className="space-y-4">
      <Toaster />
      {questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <>
          {renderQuestionList()}
          {renderPagination()}
        </>
      )}
      {renderEditDialog()}
    </div>
  );
};

export default QuestionsManager;
