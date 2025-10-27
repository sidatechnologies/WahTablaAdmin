// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import EntranceExamAttemptsTable from "@/components/recent-entrance-exam";
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
  const router = useRouter()
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin || admin?.role === "user") {
    return (
      <div>
        <h1>Contact admin to upgrade your role.</h1>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <EntranceExamAttemptsTable />
    </div>
  );
}
