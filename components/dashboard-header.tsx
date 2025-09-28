import { Admin } from '@/types/auth';

interface DashboardHeaderProps {
  admin: Admin;
}

export function DashboardHeader({ admin }: DashboardHeaderProps) {

  return (
    <header className="w-full bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {admin.name}!</p>
          {/* <div className="text-sm text-gray-600">
            {admin.email}
          </div> */}
        </div>
        
      </div>
    </header>
  );
}