// app/dashboard/admin/users/page.jsx
import { Suspense } from 'react';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UserList from '../_components/UserList';
import { CardSkeleton } from '@/components/ui/card';
import { getUsers } from '../_actions';

export default async function UsersPage() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { users, error } = await getUsers();

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="p-6">
      <Suspense fallback={<CardSkeleton className="w-full h-[200px]" />}>
        <UserList initialUsers={users} />
      </Suspense>
    </div>
  );
}
