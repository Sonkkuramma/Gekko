// app/dashboard/admin/_components/UserEnrollments.jsx

'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

const UserEnrollments = ({ users, testPacks, bundles, onEnrollmentChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollmentChange = async (userId, itemId, isEnrolling) => {
    await onEnrollmentChange(userId, itemId, isEnrolling);
    setSelectedUser(null);
    setSelectedItem(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrolled Test Packs</TableHead>
            <TableHead>Enrolled Bundles</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.enrolledTestPacks && user.enrolledTestPacks.length > 0
                  ? user.enrolledTestPacks
                      .map((tpId) => {
                        const tp = testPacks.find((pack) => pack.id === tpId);
                        return tp ? tp.title : '';
                      })
                      .join(', ')
                  : 'None'}
              </TableCell>
              <TableCell>
                {user.enrolledBundles && user.enrolledBundles.length > 0
                  ? user.enrolledBundles
                      .map((bId) => {
                        const bundle = bundles.find((b) => b.id === bId);
                        return bundle ? bundle.bundle_name : '';
                      })
                      .join(', ')
                  : 'None'}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Manage Enrollments
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Manage Enrollments</AlertDialogTitle>
                      <AlertDialogDescription>
                        Add or remove enrollments for {user.name}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <Select
                        onValueChange={(value) => {
                          setSelectedItem(JSON.parse(value));
                          setIsAdding(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item to add" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" disabled>
                            Test Packs
                          </SelectItem>
                          {testPacks.map((tp) => (
                            <SelectItem
                              key={tp.id}
                              value={JSON.stringify({
                                id: tp.id,
                                type: 'testPack',
                                title: tp.title,
                              })}
                            >
                              {tp.title}
                            </SelectItem>
                          ))}
                          <SelectItem value="" disabled>
                            Bundles
                          </SelectItem>
                          {bundles.map((b) => (
                            <SelectItem
                              key={b.id}
                              value={JSON.stringify({
                                id: b.id,
                                type: 'bundle',
                                title: b.bundle_name,
                              })}
                            >
                              {b.bundle_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {user.enrolledTestPacks &&
                        user.enrolledTestPacks.map((tpId) => {
                          const tp = testPacks.find((pack) => pack.id === tpId);
                          return tp ? (
                            <div
                              key={tp.id}
                              className="flex justify-between items-center"
                            >
                              <span>{tp.title}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleEnrollmentChange(user.id, tp.id, false)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : null;
                        })}
                      {user.enrolledBundles &&
                        user.enrolledBundles.map((bId) => {
                          const bundle = bundles.find((b) => b.id === bId);
                          return bundle ? (
                            <div
                              key={bundle.id}
                              className="flex justify-between items-center"
                            >
                              <span>{bundle.bundle_name}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleEnrollmentChange(
                                    user.id,
                                    bundle.id,
                                    false
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : null;
                        })}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      {isAdding && selectedItem && (
                        <AlertDialogAction
                          onClick={() =>
                            handleEnrollmentChange(
                              user.id,
                              selectedItem.id,
                              true
                            )
                          }
                        >
                          Add {selectedItem.title}
                        </AlertDialogAction>
                      )}
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

export default UserEnrollments;
