import EmployeeDetailsPage from "@/components/pages/EmployeeDetailsPage";

export default async function Page({ params }) {
  // Await the params to get the dynamic ID from the URL (e.g., /employee/2025-001)
  const { id } = await params; 

  return (
    <>
      <EmployeeDetailsPage employeeId={id} />
    </>
  );
}