// app/dashboard/admin/_actions.js
'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs'; // Changed from auth
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  type: z.enum(['free', 'premium', 'enterprise']),
  role: z.enum(['user', 'admin', 'moderator']),
});

async function checkAdminRole() {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    if (!user.publicMetadata?.role || user.publicMetadata.role !== 'admin') {
      return { error: 'Not authorized' };
    }

    return { success: true };
  } catch (error) {
    console.error('Auth check error:', error);
    return { error: 'Authentication failed' };
  }
}

export async function createUser(formData) {
  const authCheck = await checkAdminRole();
  if (authCheck.error) {
    return authCheck;
  }

  try {
    const validatedData = CreateUserSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      type: formData.get('type'),
      role: formData.get('role'),
    });

    const [firstName, ...lastNameParts] = validatedData.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const user = await clerkClient().users.createUser({
      emailAddress: [validatedData.email],
      firstName,
      lastName,
      publicMetadata: {
        type: validatedData.type,
        role: validatedData.role,
      },
      password: Math.random().toString(36).slice(-8), // Generate random password
    });

    revalidatePath('/dashboard/admin/users');
    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error.message || 'Failed to create user' };
  }
}

export async function updateUserRole(formData) {
  const authCheck = await checkAdminRole();
  if (authCheck.error) {
    return authCheck;
  }

  try {
    const userId = formData.get('userId');
    const role = formData.get('role');

    await clerkClient().users.updateUser(userId, {
      publicMetadata: { role },
    });

    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { error: error.message || 'Failed to update user role' };
  }
}

export async function updateUserType(formData) {
  const authCheck = await checkAdminRole();
  if (authCheck.error) {
    return authCheck;
  }

  try {
    const userId = formData.get('userId');
    const type = formData.get('type');

    await clerkClient().users.updateUser(userId, {
      publicMetadata: { type },
    });

    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user type:', error);
    return { error: error.message || 'Failed to update user type' };
  }
}

export async function deleteUser(formData) {
  const authCheck = await checkAdminRole();
  if (authCheck.error) {
    return authCheck;
  }

  try {
    const userId = formData.get('userId');
    await clerkClient().users.deleteUser(userId);

    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: error.message || 'Failed to delete user' };
  }
}

export async function getUsers() {
  const authCheck = await checkAdminRole();
  if (authCheck.error) {
    return authCheck;
  }

  try {
    const users = await clerkClient().users.getUserList();
    return {
      success: true,
      users: users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0]?.emailAddress,
        type: user.publicMetadata.type || 'free',
        role: user.publicMetadata.role || 'user',
        last_seen: user.lastSignInAt,
        created_at: user.createdAt,
        avatar_url: user.imageUrl,
      })),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: error.message || 'Failed to fetch users' };
  }
}
