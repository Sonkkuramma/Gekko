// app/dashboard/admin/page.jsx

import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/serverRoles';
import { clerkClient } from '@clerk/nextjs/server';
import { getTestPacks, getTestPackBundles } from '@/lib/db';
import AdminDashboard from './_components/AdminDashboard';

export default async function AdminDashboardPage() {
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/');
  }

  const totalSignups = await clerkClient().users.getCount();
  const users = await fetchUsers();
  const signupData = await fetchSignupData(users);
  const trendPercentage = calculateTrendPercentage(signupData);

  const testPacks = await getTestPacks();
  const bundles = await getTestPackBundles();

  return (
    <AdminDashboard
      totalSignups={totalSignups}
      signupData={signupData}
      trendPercentage={trendPercentage}
      initialUsers={users}
      testPacks={testPacks}
      bundles={bundles}
      onRoleChange={handleRoleChange}
      onTypeChange={handleTypeChange}
      onDeleteUser={handleDeleteUser}
      onUpdateUser={handleUpdateUser}
      onEnrollmentChange={handleEnrollmentChange}
    />
  );
}

async function fetchUsers() {
  const { data: userList } = await clerkClient().users.getUserList({
    limit: 500,
  });
  return userList.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddresses[0]?.emailAddress || '',
    created_at: user.createdAt,
    last_seen: user.lastSignInAt,
    role: user.publicMetadata.role || 'user',
    type: user.publicMetadata.type || 'free',
    avatar_url: user.imageUrl,
    enrolledTestPacks: user.publicMetadata.enrolledTestPacks || [],
    enrolledBundles: user.publicMetadata.enrolledBundles || [],
  }));
}

async function fetchSignupData(users) {
  const endDate = new Date();
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
  const signupCounts = {};

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setMonth(d.getMonth() + 1)
  ) {
    const monthKey = d.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    signupCounts[monthKey] = 0;
  }

  users.forEach((user) => {
    const signupDate = new Date(user.created_at);
    if (signupDate >= startDate && signupDate <= endDate) {
      const monthKey = signupDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      if (monthKey in signupCounts) {
        signupCounts[monthKey]++;
      }
    }
  });

  return Object.entries(signupCounts).map(([month, signups]) => ({
    month,
    signups,
  }));
}

function calculateTrendPercentage(signupData) {
  if (signupData.length < 2) return 0;
  const lastMonth = signupData[signupData.length - 1].signups;
  const previousMonth = signupData[signupData.length - 2].signups;
  return previousMonth !== 0
    ? (((lastMonth - previousMonth) / previousMonth) * 100).toFixed(1)
    : 100;
}

async function handleRoleChange(userId, newRole) {
  'use server';
  await clerkClient().users.updateUser(userId, {
    publicMetadata: { role: newRole },
  });
}

async function handleTypeChange(userId, newType) {
  'use server';
  await clerkClient().users.updateUser(userId, {
    publicMetadata: { type: newType },
  });
}

async function handleDeleteUser(userId) {
  'use server';
  await clerkClient().users.deleteUser(userId);
}

async function handleUpdateUser(userId, updatedData) {
  'use server';
  await clerkClient().users.updateUser(userId, {
    firstName: updatedData.name.split(' ')[0],
    lastName: updatedData.name.split(' ').slice(1).join(' '),
    emailAddresses: [{ email: updatedData.email }],
  });
}

async function handleEnrollmentChange(userId, itemId, isEnrolling) {
  'use server';
  const user = await clerkClient().users.getUser(userId);
  let enrolledTestPacks = user.publicMetadata.enrolledTestPacks || [];
  let enrolledBundles = user.publicMetadata.enrolledBundles || [];

  if (isEnrolling) {
    if (itemId.startsWith('tp_')) {
      enrolledTestPacks.push(itemId);
    } else {
      enrolledBundles.push(itemId);
    }
  } else {
    if (itemId.startsWith('tp_')) {
      enrolledTestPacks = enrolledTestPacks.filter((id) => id !== itemId);
    } else {
      enrolledBundles = enrolledBundles.filter((id) => id !== itemId);
    }
  }

  await clerkClient().users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      enrolledTestPacks,
      enrolledBundles,
    },
  });
}
