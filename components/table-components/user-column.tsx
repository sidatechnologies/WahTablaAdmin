"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";

import { Button } from "@/components/ui/button";
import { Admin } from "@/types/auth";
import { useUpdateAdminRoleMutation } from "@/hooks/update-admin-role";
import { useMemo } from "react";

const columnHelper = createColumnHelper<Admin>();

export const useUserColumns = (): ColumnDef<Admin, any>[] => {
  const { mutate, isPending } = useUpdateAdminRoleMutation();
  const { mutate: demote, isPending: isDemoting } = useUpdateAdminRoleMutation();

  return useMemo(() => [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        if(user.role === 'admin') {
          return (
            <Button
            onClick={() => demote({ adminId: Number(user.id), role: "user" })}
            disabled={isDemoting}
          >
            {isDemoting ? "Updating..." : "Demote Role"}
          </Button>
          )
        }
        return (
          <Button
            onClick={() => mutate({ adminId: Number(user.id), role: "admin" })}
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update Role"}
          </Button>
        );
      },
    }),
  ], [mutate, isPending]);
};

