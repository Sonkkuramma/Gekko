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

const SectionIdManager = () => {
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ name: '', exam_id: '' });
  const [exams, setExams] = useState([]);
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    fetchSections();
    fetchExams();
  }, []);

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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/id/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      });
      if (!response.ok) throw new Error('Failed to create section');
      fetchSections();
      setNewSection({ name: '', exam_id: '' });
      toast.success('Section created successfully');
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const handleUpdate = async (id, updatedSection) => {
    try {
      const response = await fetch(`/api/id/section?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSection),
      });
      if (!response.ok) throw new Error('Failed to update section');
      fetchSections();
      setEditingSection(null);
      toast.success('Section updated successfully');
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/id/section?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete section');
      fetchSections();
      toast.success('Section deleted successfully');
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />
      {/* <h3 className="text-xl font-semibold">Section ID Management</h3> */}
      <div className="flex space-x-2">
        <Input
          placeholder="Section Name"
          value={newSection.name}
          onChange={(e) =>
            setNewSection({ ...newSection, name: e.target.value })
          }
        />
        <Select
          value={newSection.exam_id}
          onValueChange={(value) =>
            setNewSection({ ...newSection, exam_id: value })
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
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Section Name</TableHead>
            <TableHead>Section ID</TableHead>
            <TableHead>Exam ID</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <TableRow key={section.section_id}>
              <TableCell>{section.name}</TableCell>
              <TableCell>{section.section_id}</TableCell>
              <TableCell>{section.exam_id}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="mr-2">
                      Edit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Edit Section</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to edit this section? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={editingSection?.name || section.name}
                      onChange={(e) =>
                        setEditingSection({ ...section, name: e.target.value })
                      }
                    />
                    <Select
                      value={editingSection?.exam_id || section.exam_id}
                      onValueChange={(value) =>
                        setEditingSection({ ...section, exam_id: value })
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
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setEditingSection(null)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleUpdate(
                            section.section_id,
                            editingSection || section
                          )
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
                        delete the section and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(section.section_id)}
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

export default SectionIdManager;
