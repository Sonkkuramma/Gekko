// serverRoles.ts
import { auth } from '@clerk/nextjs/server';
import { Roles, getUserRoleFromMetadata } from './roles';

export const checkRole = async (requiredRole: Roles): Promise<boolean> => {
  const { sessionClaims } = await auth();
  const userRole = getUserRoleFromMetadata(sessionClaims?.metadata);
  return userRole === requiredRole;
}