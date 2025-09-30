"use client";

// import Image from "next/image";
// import * as z from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { UserDataTable } from "./table-components/user-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormLabel,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
import { useTransition, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Admin } from "@/types/auth";
import { User } from "lucide-react";

interface ProductDataTableProps<TData extends Admin, TValue extends object> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
const SettingsPageComponents = <TData extends Admin, TValue extends object>({
  columns,
  data,
}: ProductDataTableProps<TData, TValue>) => {
  const { admin } = useAuth();

  // const [isPending, startTransition] = useTransition();
  // const [error, setError] = useState<string | undefined>();
  // const [success, setSuccess] = useState<string | undefined>();

  // const onSubmit = () => {
  //   startTransition(() => {
  //     // settings(values)
  //     //   .then((data) => {
  //     //     if (data.error) {
  //     //       setError(data.error);
  //     //     }
  //     //     if (data.success) {
  //     //       update();
  //     //       setSuccess(data.success);
  //     //     }
  //     //   })
  //     //   .catch(() => setError("Something went wrong!"));
  //   });
  // };

  return (
    <div className="w-full flex flex-col justify-center items-start gap-3">
      <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-3">
        <Card className="w-80 flex flex-col justify-center items-center">
          <CardHeader className="w-full overflow-hidden">
            <span className="w-30 h-30 rounded-full bg-blue-800 flex items-center justify-center">
              <User className="text-white w-14 h-14"/>
            </span>
            <CardTitle className="text-4xl">{admin?.name}</CardTitle>
            <CardDescription className="text-xl">
              {admin?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full flex justify-between gap-4 text-lg text-muted-foreground font-semibold">
            <Badge variant="default">{admin?.role}</Badge>
            {/* <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you
                    done.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="John Doe"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {user?.isOAuth === false && (
                        <>
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="johndoe@example.com"
                                    disabled={isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="******"
                                    disabled={isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="password"
                                    placeholder="******"
                                    disabled={isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button disabled={isPending} type="submit">
                      Save changes
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Admin Table</CardTitle>
            <CardDescription>
              This table consists of all the member with this Dashboard access
              or the one requesting for access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserDataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPageComponents;
