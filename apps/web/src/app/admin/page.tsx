import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  try {
    const user = await requireAdmin();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Welcome, <span className="font-semibold">{user.name}</span>!
          </p>
          <p className="text-gray-600">
            You have admin access to this system.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    redirect('/');
  }
}
