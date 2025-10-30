"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { useEntranceExamAttempts } from "@/hooks/useEntranceExamAttempts";
import { EntranceExamAttempt } from "@/types/exam-attempts";
import {
  Search,
  Eye,
  X,
  Calendar,
  User,
  BookOpen,
  FileText,
  Link,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useUpdateEntranceExamAttempt } from "@/hooks/use-update-entrance-exam-attempts";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface ExamAttemptDialogProps {
  attempt: EntranceExamAttempt | null;
  isOpen: boolean;
  onClose: () => void;
  onGrade: (
    attemptId: number,
    passed: boolean,
    marks?: number | string,
    feedback?: string | null
  ) => void;
}

function ExamAttemptDialog({
  attempt,
  isOpen,
  onClose,
  onGrade,
}: ExamAttemptDialogProps) {
  const [marks, setMarks] = useState<number | string>(
    attempt?.totalMarks || 0
  );
  const [feedback, setFeedback] = useState<string | null | undefined>("");
  const [isGrading, setIsGrading] = useState(false);

  // console.log(attempt?.finalExamDetails?.totalMarks, marks)

  const handleGrade = async (passed: boolean) => {
    setIsGrading(true);
    try {
      onGrade(
        attempt!.attemptId,
        passed,
        undefined,
        feedback
      );
      onClose();
    } catch (error) {
      console.error("Grading failed:", error);
    } finally {
      setIsGrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Passed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!attempt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{attempt.examTitle}</DialogTitle>
        </DialogHeader>

        <div className="w-full space-y-6">
          {/* Exam & User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Exam Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="font-medium">{attempt.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-medium">{attempt.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    Entrance Exam
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(attempt.status)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Student Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-medium">{attempt.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{attempt.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">
                    {formatDate(attempt.dateTime)}
                  </span>
                </div>
                {attempt.gradedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graded:</span>
                    <span className="font-medium">
                      {formatDate(attempt.gradedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                Assignment Submissions
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Submission Link:
                </Label>
                <a
                  href={attempt.videoUrl ? attempt.videoUrl : ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <Link className="w-4 h-4" />
                  View Submission
                </a>
              </div>
            </div>
          </div>

          <Separator />

          {/* Grading Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Grading</h3>
            <div className="space-y-4 flex flex-col gap-8">
              <div className="space-y-2">
                <Label htmlFor="marks">Examiner Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback ?? ""}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-32"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleGrade(true)}
                  disabled={isGrading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isGrading ? "Processing..." : "Pass"}
                </Button>

                <Button
                  onClick={() => handleGrade(false)}
                  disabled={isGrading}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isGrading ? "Processing..." : "Fail"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EntranceExamAttemptsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAttempt, setSelectedAttempt] = useState<EntranceExamAttempt | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: queryResult, isLoading, isError, error } = useEntranceExamAttempts();
  console.log({queryResult})

  const updateExamAttemptMutation = useUpdateEntranceExamAttempt({
    onSuccess: (data) => {
      console.log("Exam attempt graded successfully:", data);
      // Additional success handling if needed
    },
    onError: (error) => {
      console.error("Failed to grade exam attempt:", error);
      // Additional error handling if needed
    },
    invalidateQueries: ["exam-attempts", "exam-attempt-details"], // Adjust based on your query keys
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Passed
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const columns: ColumnDef<EntranceExamAttempt>[] = [
    {
      accessorKey: "examTitle",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Exam Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.examTitle}</div>
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.username}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Course
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.course}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.year}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "mcqstatus",
      header: "MCQs Status",
      cell: ({ row }) => getStatusBadge(row.original.mcqPassed ? 'passed' : 'failed'),
    },
    {
      accessorKey: "dateTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {new Date(row.original.dateTime).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAttempt(row.original);
            setIsDialogOpen(true);
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: queryResult?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleGrade = async (
    attemptId: number,
    passed: boolean,
    marks?: number | string,
    feedback?: string | null
  ) => {
    // TODO: Implement API call for grading
    console.log("Grading attempt:", { attemptId, passed, marks, feedback });

    if (!attemptId || typeof attemptId !== "number") {
      toast.error("Invalid attempt ID");
      console.error("Invalid attempt ID");
      return;
    }

    if (typeof passed !== "boolean") {
      toast.error("Passed status must be a boolean");
      console.error("Passed status must be a boolean");
      return;
    }

    // if (typeof marks !== 'number' || marks < 0) {
    //   console.error('Marks must be a non-negative number');
    //   toast.error('Marks must be a non-negative number');
    //   return;
    // }

    // if (!feedback || typeof feedback !== 'string') {
    //   console.error('Feedback is required and must be a string');
    //   return;
    // }
    // This will be replaced with actual API call

    updateExamAttemptMutation.mutate({
      attemptId,
      passed,
      marks,
      feedback,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading exam attempts...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">Error loading exam attempts</div>
        <div className="text-muted-foreground text-sm">{error?.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entrance Exam Attempts</h1>
          <p className="text-muted-foreground">
            Manage and grade student entrance exam submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students, exams, or courses..."
              value={
                (table.getColumn("examTitle")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("examTitle")?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-sm"
            />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
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
      </div>

      {/* Dialog */}
      <ExamAttemptDialog
        attempt={selectedAttempt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onGrade={handleGrade}
      />
    </div>
  );
}
