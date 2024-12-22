import { redirect } from 'next/navigation';
import { getUserRole } from '@/utils/serverRoles';

export default function Dashboard() {
  const userRole = getUserRole();

  if (userRole === 'admin') {
    redirect('/dashboard/admin');
  } else if (userRole === 'mentor') {
    redirect('/dashboard/mentor');
  } else {
    redirect('/dashboard/user');
  }
}
