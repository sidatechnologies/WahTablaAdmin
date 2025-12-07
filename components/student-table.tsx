'use client'

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Search, Filter, RefreshCw, Users, UserCheck, DollarSign } from 'lucide-react';
import { useStudents, useStudentsWithUtils } from '@/hooks/use-student-data';
import { Student } from '@/types/student';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from './ui/select';

// Badge Component
const Badge = ({ children, variant = 'default', className = '' }: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    destructive: 'bg-red-100 text-red-800 hover:bg-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  };

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// Select Component
const CSelect = ({ children, value, onValueChange, className = '' }: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </select>
  );
};

// Card Components
const Card = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
);

const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

const StudentsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const { data: students, isLoading, error, isError, refetch } = useStudentsWithUtils();
  const [openDrawer, setOpenDrawer] = useState<number | null>(null);
  const [open, setOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const [analyticsDrawerOpen, setAnalyticsDrawerOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedAnalytics, setSelectedAnalytics] = useState<any[]>([])

  const [filters, setFilters] = React.useState({
    userId: "",
    username: "",
    fullName: "",
    profileCompleted: "all", // all | complete | incomplete
    minOrders: "",
    maxOrders: "",
    minSpent: "",
    maxSpent: "",
    registeredFrom: "",
    registeredTo: "",
    hasPurchases: "all", // all | yes | no
  });


  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)

    if (!isOpen) {
      setOpenDrawer(null)
    }
  }
  // fallback empty array to avoid crash before data is ready
  const studentUsers = students?.data?.users ?? [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'userId',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          ID
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          #{row.getValue('userId')}
        </div>
      ),
    },
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Username
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">{row.getValue('username')}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="text-gray-900">
          {row.getValue('fullName') === 'Not provided' ? (
            <span className="text-gray-400 italic">Not provided</span>
          ) : (
            row.getValue('fullName')
          )}
        </div>
      ),
    },
    {
      accessorKey: 'profileCompleted',
      header: 'Profile Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('profileCompleted') ? 'success' : 'warning'}>
          {row.getValue('profileCompleted') ? 'Complete' : 'Incomplete'}
        </Badge>
      ),
    },
    {
      accessorKey: 'totalOrders',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Orders
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.getValue('totalOrders')}
        </div>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Total Spent
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium text-green-600">
          {formatCurrency(row.getValue('totalSpent'), row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: 'registeredAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 hover:bg-transparent"
        >
          Registered
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.getValue('registeredAt'))}
        </div>
      ),
    },
    {
      accessorKey: 'lastOrderDate',
      header: 'Last Order',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {formatDate(row.getValue('lastOrderDate'))}
        </div>
      ),
    },
    {
      accessorKey: 'hasPurchases',
      header: 'Purchase Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('hasPurchases') ? 'success' : 'default'}>
          {row.getValue('hasPurchases') ? 'Active' : 'No Purchases'}
        </Badge>
      ),
    },
  ];

  const filteredData = React.useMemo(() => {
    const list = studentUsers ?? [];

    return list.filter((student) => {

      // ID
      if (filters.userId && !String(student.userId).includes(filters.userId)) {
        return false;
      }

      // Username
      if (filters.username && !student.username.toLowerCase().includes(filters.username.toLowerCase())) {
        return false;
      }

      // Full name
      if (filters.fullName && !student.fullName.toLowerCase().includes(filters.fullName.toLowerCase())) {
        return false;
      }

      // Profile Completed
      if (filters.profileCompleted === "complete" && !student.profileCompleted) return false;
      if (filters.profileCompleted === "incomplete" && student.profileCompleted) return false;

      // Orders
      const minOrders = Number(filters.minOrders);
      const maxOrders = Number(filters.maxOrders);
      const totalOrders = Number(student.totalOrders); // <--- cast here

      if (!isNaN(minOrders) && totalOrders < minOrders) return false;
      if (!isNaN(maxOrders) && totalOrders > maxOrders) return false;


      // Total Spent
      if (filters.minSpent && student.totalSpent < Number(filters.minSpent)) return false;
      if (filters.maxSpent && student.totalSpent > Number(filters.maxSpent)) return false;

      // Registered date range
      const reg = new Date(student.registeredAt).getTime();
      if (filters.registeredFrom && reg < new Date(filters.registeredFrom).getTime()) return false;
      if (filters.registeredTo && reg > new Date(filters.registeredTo).getTime()) return false;

      // Purchase Status
      if (filters.hasPurchases === "yes" && !student.hasPurchases) return false;
      if (filters.hasPurchases === "no" && student.hasPurchases) return false;

      return true;
    });

  }, [studentUsers, filters]);



  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading student data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">Error loading exam attempts</div>
      </div>
    );
  }

  if (studentUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">No student data found!</span>
      </div>
    );
  }

  // Statistics
  const totalStudents = studentUsers.length;
  const completedProfiles = studentUsers.filter(s => s.profileCompleted).length;
  const revenueByCurrency: Record<string, number> = studentUsers.reduce(
    (acc: Record<string, number>, user: any) => {
      const currency = user.currency ?? "UNKNOWN";
      const amount = Number(user.totalSpent) || 0;

      if (!acc[currency]) {
        acc[currency] = 0;
      }

      acc[currency] += amount;
      return acc;
    },
    {}
  );

  return (
    <div className="w-full space-y-4 rounded-md">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-gray-500">Active registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Profiles</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProfiles}</div>
            <p className="text-xs text-gray-500">
              {((completedProfiles / totalStudents) * 100).toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueByCurrency['USD'], 'USD')}</div>
            <p className="text-xs text-gray-500">From all student purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (INR)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueByCurrency['INR'], 'INR')}</div>
            <p className="text-xs text-gray-500">From all student purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger className='cursor-pointer'>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                    <DialogDescription>
                      Apply various filters to refine the student list.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 mt-4">

                    <Input
                      placeholder="User ID"
                      value={filters.userId}
                      onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    />

                    <Input
                      placeholder="Username"
                      value={filters.username}
                      onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                    />

                    <Input
                      placeholder="Full Name"
                      value={filters.fullName}
                      onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
                    />

                    {/* Profile Status */}
                    <Select
                      value={filters.profileCompleted}
                      onValueChange={(v) => setFilters({ ...filters, profileCompleted: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Profile Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Orders */}
                    <Input
                      placeholder="Min Orders"
                      type="number"
                      value={filters.minOrders}
                      onChange={(e) => setFilters({ ...filters, minOrders: e.target.value })}
                    />

                    <Input
                      placeholder="Max Orders"
                      type="number"
                      value={filters.maxOrders}
                      onChange={(e) => setFilters({ ...filters, maxOrders: e.target.value })}
                    />

                    {/* Total Spent */}
                    <Input
                      placeholder="Min Spent"
                      type="number"
                      value={filters.minSpent}
                      onChange={(e) => setFilters({ ...filters, minSpent: e.target.value })}
                    />

                    <Input
                      placeholder="Max Spent"
                      type="number"
                      value={filters.maxSpent}
                      onChange={(e) => setFilters({ ...filters, maxSpent: e.target.value })}
                    />

                    {/* Registered Date Range */}
                    <Input
                      type="date"
                      value={filters.registeredFrom}
                      onChange={(e) => setFilters({ ...filters, registeredFrom: e.target.value })}
                    />

                    <Input
                      type="date"
                      value={filters.registeredTo}
                      onChange={(e) => setFilters({ ...filters, registeredTo: e.target.value })}
                    />

                    {/* Purchase Status */}
                    <Select
                      value={filters.hasPurchases}
                      onValueChange={(v) => setFilters({ ...filters, hasPurchases: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Purchase Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Has Purchases</SelectItem>
                        <SelectItem value="no">No Purchases</SelectItem>
                      </SelectContent>
                    </Select>

                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFilters({
                          userId: "",
                          username: "",
                          fullName: "",
                          profileCompleted: "all",
                          minOrders: "",
                          maxOrders: "",
                          minSpent: "",
                          maxSpent: "",
                          registeredFrom: "",
                          registeredTo: "",
                          hasPurchases: "all",
                        })
                      }
                    >
                      Reset
                    </Button>

                    <Button onClick={() => {
                      setIsDialogOpen(false);
                    }}>Apply Filters</Button>
                  </div>
                </DialogContent>
              </Dialog>

            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="rounded-md border">
            <Table className="w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-12 px-4 text-left  font-medium text-gray-900">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b transition-colors hover:bg-gray-50 items-center justify-center"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableHead key={cell.id} className="p-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableHead>
                      ))}
                      <Dialog onOpenChange={handleDialogChange}>
                        <DialogTrigger className='mt-[9px] cursor-pointer mr-5 p-2 border rounded-md'>
                          Analytics
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px]">
                          <DialogHeader>
                            <DialogTitle>Analytics</DialogTitle>
                            <DialogDescription>
                              Below are the analytics for student {row.original.username}.
                            </DialogDescription>
                          </DialogHeader>

                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course Name</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.values(row.original.purchasedDetails || {}).map(
                                (course: any, idx: number) => {
                                  // aggregate counts
                                  const examCount = course.exams?.length || 0;
                                  const yearCount = course.years?.length || 0
                                  const moduleCount = course.years?.reduce(
                                    (acc: number, y: any) => acc + (y.modules?.length || 0),
                                    0
                                  );
                                  const monthCount = course.years?.reduce(
                                    (acc: number, y: any) =>
                                      acc +
                                      y.modules?.reduce(
                                        (mAcc: number, m: any) => mAcc + (m.months?.length || 0),
                                        0
                                      ),
                                    0
                                  );
                                  const videoCount = course.years?.reduce(
                                    (acc: number, y: any) =>
                                      acc +
                                      y.modules?.reduce(
                                        (mAcc: number, m: any) =>
                                          mAcc +
                                          m.months?.reduce(
                                            (moAcc: number, mo: any) =>
                                              moAcc + (mo.videos?.length || 0),
                                            0
                                          ),
                                        0
                                      ),
                                    0
                                  );

                                  let watchedVideosForCourse = 0
                                  row.original.analytics.map((analytic: any) => {
                                    if (analytic.courseId === course.courseId) {
                                      watchedVideosForCourse++
                                    }
                                  })

                                  return (
                                    <TableRow key={idx} className={`h-full overflow-scroll w-full`}>
                                      <TableCell className="font-medium">
                                        {course.courseName}
                                        <Table className='border rounded-lg mt-3'>
                                          <TableHeader className=''>
                                            <TableRow>
                                              <TableHead>Year Name</TableHead>
                                              <TableHead>Total Modules</TableHead>
                                              <TableHead>Total Videos</TableHead>
                                              <TableHead>Watched/Available</TableHead>
                                              <TableHead>Actions</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {course.years?.map((year: any, id: number) => {
                                              const yearModules = year.modules?.length || 0;
                                              const yearVideos =
                                                year.modules?.reduce(
                                                  (acc: number, m: any) =>
                                                    acc +
                                                    m.months?.reduce(
                                                      (moAcc: number, mo: any) =>
                                                        moAcc + (mo.videos?.length || 0),
                                                      0
                                                    ),
                                                  0
                                                ) || 0;

                                              let watchedVideosForYears = 0
                                              row.original.analytics.map((analytic: any) => {
                                                if (analytic.yearId === year.yearId && analytic.courseId === course.courseId) {
                                                  watchedVideosForYears++
                                                }
                                              })

                                              return (
                                                <TableRow key={year.yearId}>
                                                  <TableCell>{year.yearName}</TableCell>
                                                  <TableCell>{yearModules}</TableCell>
                                                  <TableCell>{yearVideos}</TableCell>
                                                  <TableCell>{watchedVideosForYears}</TableCell>
                                                  <TableCell>
                                                    <p
                                                      className='cursor-pointer underline'
                                                      onClick={() => {
                                                        // filter analytics for this course + year
                                                        const analyticsForYear = row.original.analytics.filter(
                                                          (analytic: any) =>
                                                            analytic.courseId === course.courseId && analytic.yearId === year.yearId && !analytic.isExam
                                                        )

                                                        setSelectedYear(year)
                                                        setSelectedCourse(course)
                                                        setSelectedAnalytics(analyticsForYear)
                                                        setAnalyticsDrawerOpen(true)
                                                        setOpenDrawerId(id)
                                                      }}
                                                    >
                                                      {
                                                        openDrawerId === id ? 'Close Details' : 'View Details'
                                                      }
                                                    </p>
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            })}
                                          </TableBody>
                                        </Table>
                                        <Drawer
                                          open={analyticsDrawerOpen}
                                          onOpenChange={() => {
                                            setOpenDrawerId(null);
                                            setAnalyticsDrawerOpen(false);
                                          }}
                                        >
                                          <DrawerContent className="h-[50vh] flex flex-col">
                                            <DrawerHeader>
                                              <DrawerTitle>
                                                {selectedCourse?.courseName} - {selectedYear?.yearName}
                                              </DrawerTitle>
                                              <DrawerDescription>
                                                Video analytics for {row.original.username}
                                              </DrawerDescription>
                                            </DrawerHeader>
                                            <div className="flex-1 overflow-y-auto">
                                              <Table>
                                                <TableHeader>
                                                  <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Played</TableHead>
                                                    <TableHead>Paused</TableHead>
                                                    <TableHead>Seeked</TableHead>
                                                    <TableHead>Total Duration (S)</TableHead>
                                                    <TableHead>Watched Duration (S)</TableHead>
                                                    <TableHead>Watched Progress (%)</TableHead>
                                                    <TableHead>Started At</TableHead>
                                                    <TableHead>Ended At</TableHead>
                                                    <TableHead>Status</TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {selectedAnalytics.length > 0 ? (
                                                    selectedAnalytics.map((video) => (
                                                      <TableRow key={video.analyticsId}>
                                                        <TableCell>{video.videoName}</TableCell>
                                                        <TableCell>{video.playCount}</TableCell>
                                                        <TableCell>{video.pauseCount}</TableCell>
                                                        <TableCell>{video.seekCount}</TableCell>
                                                        <TableCell>{video.durationSeconds}</TableCell>
                                                        <TableCell>{video.watchedSeconds}</TableCell>
                                                        <TableCell>{video.watchProgress}</TableCell>
                                                        <TableCell>
                                                          {new Date(video.startDate).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                          })}
                                                        </TableCell>
                                                        <TableCell>
                                                          {video.fullyWatched
                                                            ? new Date(video.endDate).toLocaleDateString("en-US", {
                                                              year: "numeric",
                                                              month: "short",
                                                              day: "numeric",
                                                            })
                                                            : "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                          {video.fullyWatched ? (
                                                            <Badge variant="success">Completed</Badge>
                                                          ) : (
                                                            <Badge variant="warning">InProgress</Badge>
                                                          )}
                                                        </TableCell>
                                                      </TableRow>
                                                    ))
                                                  ) : (
                                                    <TableRow>
                                                      <TableCell
                                                        colSpan={10}
                                                        className="text-center text-gray-500"
                                                      >
                                                        No analytics found for this year.
                                                      </TableCell>
                                                    </TableRow>
                                                  )}
                                                </TableBody>
                                              </Table>
                                            </div>
                                          </DrawerContent>
                                        </Drawer>
                                      </TableCell>
                                    </TableRow>
                                  );
                                }
                              )}
                            </TableBody>
                          </Table>
                        </DialogContent>
                      </Dialog>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableHead colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableHead>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-gray-500">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsTable;