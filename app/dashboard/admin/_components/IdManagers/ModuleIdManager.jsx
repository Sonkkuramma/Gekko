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

const ModuleIdManager = () => {
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({
    name: '',
    exam_id: '',
    section_id: '',
  });
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [editingModule, setEditingModule] = useState(null);

  useEffect(() => {
    fetchModules();
    fetchExams();
    fetchSections();
  }, []);

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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/id/module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModule),
      });
      if (!response.ok) throw new Error('Failed to create module');
      const createdModule = await response.json();
      setModules([...modules, createdModule]);
      setNewModule({ name: '', exam_id: '', section_id: '' });
      toast.success('Module created successfully');
    } catch (error) {
      toast.error('Failed to create module');
    }
  };

  const handleUpdate = async (id, updatedModule) => {
    try {
      const response = await fetch(`/api/id/module?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedModule),
      });
      if (!response.ok) throw new Error('Failed to update module');
      const updatedModuleData = await response.json();
      setModules(
        modules.map((module) =>
          module.module_id === id ? updatedModuleData : module
        )
      );
      setEditingModule(null);
      toast.success('Module updated successfully');
    } catch (error) {
      toast.error('Failed to update module');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/id/module?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete module');
      setModules(modules.filter((module) => module.module_id !== id));
      toast.success('Module deleted successfully');
    } catch (error) {
      toast.error('Failed to delete module');
    }
  };

  return (
    <div className="space-y-4">
      <Toaster />
      <div className="flex space-x-2">
        <Input
          placeholder="Module Name"
          value={newModule.name}
          onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
        />
        <Select
          value={newModule.exam_id}
          onValueChange={(value) =>
            setNewModule({ ...newModule, exam_id: value })
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
          value={newModule.section_id}
          onValueChange={(value) =>
            setNewModule({ ...newModule, section_id: value })
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
        <Button onClick={handleCreate}>Create</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Module Name</TableHead>
            <TableHead>Module ID</TableHead>
            <TableHead>Exam ID</TableHead>
            <TableHead>Section ID</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.module_id}>
              <TableCell>{module.name}</TableCell>
              <TableCell>{module.module_id}</TableCell>
              <TableCell>{module.exam_id}</TableCell>
              <TableCell>{module.section_id}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="mr-2">
                      Edit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Edit Module</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to edit this module? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                      value={editingModule?.name || module.name}
                      onChange={(e) =>
                        setEditingModule({ ...module, name: e.target.value })
                      }
                    />
                    <Select
                      value={editingModule?.exam_id || module.exam_id}
                      onValueChange={(value) =>
                        setEditingModule({ ...module, exam_id: value })
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
                      value={editingModule?.section_id || module.section_id}
                      onValueChange={(value) =>
                        setEditingModule({ ...module, section_id: value })
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
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setEditingModule(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleUpdate(
                            module.module_id,
                            editingModule || module
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
                        delete the module and remove its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(module.module_id)}
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

export default ModuleIdManager;
