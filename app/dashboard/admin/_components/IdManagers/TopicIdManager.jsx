import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TopicIdManager = () => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({
    name: '',
    exam_id: '',
    section_id: '',
    module_id: '',
  });
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [modules, setModules] = useState([]);
  const [editingTopic, setEditingTopic] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  });

  useEffect(() => {
    fetchTopics();
    fetchExams();
    fetchSections();
    fetchModules();
  }, []);

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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/id/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic),
      });
      if (!response.ok) throw new Error('Failed to create topic');
      const createdTopic = await response.json();
      setTopics([...topics, createdTopic]);
      setNewTopic({ name: '', exam_id: '', section_id: '', module_id: '' });
      toast.success('Topic created successfully');
    } catch (error) {
      toast.error('Failed to create topic');
    }
  };

  const handleUpdate = async (id, updatedTopic) => {
    try {
      const response = await fetch(`/api/id/topic?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTopic),
      });
      if (!response.ok) throw new Error('Failed to update topic');
      const updatedTopicData = await response.json();
      setTopics(
        topics.map((topic) =>
          topic.topic_id === id ? updatedTopicData : topic
        )
      );
      setEditingTopic(null);
      toast.success('Topic updated successfully');
    } catch (error) {
      toast.error('Failed to update topic');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/id/topic?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete topic');
      setTopics(topics.filter((topic) => topic.topic_id !== id));
      toast.success('Topic deleted successfully');
    } catch (error) {
      toast.error('Failed to delete topic');
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedTopics = () => {
    const sortableTopics = [...topics];
    if (sortConfig.key !== null) {
      sortableTopics.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTopics;
  };

  const SortableHeader = ({ column }) => (
    <TableHead onClick={() => requestSort(column)} className="cursor-pointer">
      <div className="flex items-center">
        {column.charAt(0).toUpperCase() + column.slice(1).replace('_', ' ')}
        {sortConfig.key === column &&
          (sortConfig.direction === 'ascending' ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          ))}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <Toaster />
      <div className="flex space-x-2">
        <Input
          placeholder="Topic Name"
          value={newTopic.name}
          onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
        />
        <Select
          value={newTopic.exam_id}
          onValueChange={(value) =>
            setNewTopic({ ...newTopic, exam_id: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.exam_id} value={exam.exam_id}>
                {exam.name} ({exam.exam_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newTopic.section_id}
          onValueChange={(value) =>
            setNewTopic({ ...newTopic, section_id: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.section_id} value={section.section_id}>
                {section.name} ({section.section_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newTopic.module_id}
          onValueChange={(value) =>
            setNewTopic({ ...newTopic, module_id: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Module" />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module) => (
              <SelectItem key={module.module_id} value={module.module_id}>
                {module.name} ({module.module_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader column="name" />
            <SortableHeader column="topic_id" />
            <SortableHeader column="exam_id" />
            <SortableHeader column="section_id" />
            <SortableHeader column="module_id" />
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getSortedTopics().map((topic) => (
            <TableRow key={topic.topic_id}>
              <TableCell>{topic.name}</TableCell>
              <TableCell>{topic.topic_id}</TableCell>
              <TableCell>{topic.exam_id}</TableCell>
              <TableCell>{topic.section_id}</TableCell>
              <TableCell>{topic.module_id}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="mr-2">
                      Edit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Edit Topic</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to edit this topic? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={editingTopic?.name || topic.name}
                      onChange={(e) =>
                        setEditingTopic({ ...topic, name: e.target.value })
                      }
                    />
                    <Select
                      value={editingTopic?.exam_id || topic.exam_id}
                      onValueChange={(value) =>
                        setEditingTopic({ ...topic, exam_id: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.exam_id} value={exam.exam_id}>
                            {exam.name} ({exam.exam_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={editingTopic?.section_id || topic.section_id}
                      onValueChange={(value) =>
                        setEditingTopic({ ...topic, section_id: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem
                            key={section.section_id}
                            value={section.section_id}
                          >
                            {section.name} ({section.section_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={editingTopic?.module_id || topic.module_id}
                      onValueChange={(value) =>
                        setEditingTopic({ ...topic, module_id: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem
                            key={module.module_id}
                            value={module.module_id}
                          >
                            {module.name} ({module.module_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setEditingTopic(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleUpdate(topic.topic_id, editingTopic || topic)
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the topic and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(topic.topic_id)}
                      >
                        Continue
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

export default TopicIdManager;
