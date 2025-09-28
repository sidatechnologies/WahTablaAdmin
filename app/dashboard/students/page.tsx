import { fetchAllStudents } from "@/lib/actions/student";
import StudentsTable from "@/components/student-table";



const StudentsPage = async () => {
  const students = await fetchAllStudents()
  if(!students.success || !students.data){
    return(
      <div className="w-full h-screen flex flex-col justify-center items-center">
        No students data found!
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center items-center">
      <StudentsTable />
    </div>
  )
}

export default StudentsPage