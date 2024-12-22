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

const ExamIdManager = () => {
  const [exams, setExams] = useState([]);
  const [newExam, setNewExam] = useState({ name: '' });
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/id/exam');
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/id/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam),
      });
      if (!response.ok) {
        throw new Error('Failed to create exam');
      }
      fetchExams();
      setNewExam({ name: '' });
      toast.success('Exam created successfully');
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    }
  };

  const handleUpdate = async (id, updatedExam) => {
    try {
      const response = await fetch(`/api/id/exam?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExam),
      });
      if (!response.ok) {
        throw new Error('Failed to update exam');
      }
      fetchExams();
      setEditingExam(null);
      toast.success('Exam updated successfully');
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/id/exam?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }
      fetchExams();
      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />
      {/* <h3 className="text-xl font-semibold">Exam ID Management</h3> */}
      <div className="flex space-x-2">
        <Input
          placeholder="Exam Name"
          value={newExam.name}
          onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
        />
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Name</TableHead>
            <TableHead>Exam ID</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.exam_id}>
              <TableCell>{exam.name}</TableCell>
              <TableCell>{exam.exam_id}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="mr-2">
                      Edit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Edit Exam</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to edit this exam? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={editingExam?.name || exam.name}
                      onChange={(e) =>
                        setEditingExam({ ...exam, name: e.target.value })
                      }
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setEditingExam(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleUpdate(exam.exam_id, editingExam || exam)
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
                        delete the exam and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(exam.exam_id)}
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

export default ExamIdManager;
