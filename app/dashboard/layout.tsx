// app/dashboard/layout.tsx
"use client";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Settings,
  User,
  Lock,
  Activity,
  Menu,
  X,
  LogOut,
  LucideProps,
} from "lucide-react";
import React, { useState, useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardContent>{children}</DashboardContent>
    </AuthGuard>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { admin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">

      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          lg:block pt-16 lg:pt-0
        `}
        >
          <div className="h-full flex flex-col">
            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Navigation
              </h3>
              <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
              <SidebarLink href="/dashboard/students" icon={Users} label="Students" />
              {/* <SidebarLink
                href="/dashboard/reports"
                icon={FileText}
                label="Reports"
              />
              <SidebarLink
                href="/dashboard/analytics"
                icon={Activity}
                label="Analytics"
              /> */}
              <SidebarLink
                href="/dashboard/settings"
                icon={Settings}
                label="Settings"
              />
            </nav>

            {/* Quick Actions */}
            <div className="px-4 pb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    size="sm"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    size="sm"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isPending ? "Signing out..." : "Sign out"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
          <div className="container mx-auto py-6 px-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${
          isActive
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
      >
        <Icon className="w-4 h-4 mr-3" />
        {label}
      </div>
    </Link>
  );
}
