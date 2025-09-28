'use client'
import { useUserColumns } from "@/components/table-components/user-column";

import SettingsPageComponents from "@/components/settings";
import { useFetchAllAdmins } from "@/hooks/use-all-admins-data";



const SettingPage = () => {
  const {data, isPending, isError, error} = useFetchAllAdmins();
  const columns = useUserColumns()

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading Admin Panle users data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">Error loading Admin Panle User data</div>
        <div className="text-muted-foreground text-sm">{error?.message}</div>
      </div>
    );
  }
  if(!data){
    return(
      <div className="w-full h-screen flex flex-col justify-center items-center">
        No admin data found!
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center items-center">
      <SettingsPageComponents columns={columns} data={data} />
    </div>
  )
}

export default SettingPage