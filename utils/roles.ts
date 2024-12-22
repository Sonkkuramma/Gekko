// utils/roles.ts
export type Roles = 'admin' | 'mentor' | 'user'

export const getUserRoleFromMetadata = (metadata: any): Roles => {
  const role = metadata?.role
  if (Array.isArray(role) && role.length > 0) {
    return role[0] as Roles
  }
  return (role as Roles) || 'user'
}