import { Routes, Route } from "react-router-dom";
import EmpDocumentList from "../../../components/Settings/OrganizationSettings/EmployeeFields/EmployeeDocuments/EmpDocumentList";
import AddEmpDocumentsForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/EmployeeDocuments/AddEmpDocumentForm";


export default function EmpDocsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EmpDocumentList />} />
      <Route path="add-document" element={<AddEmpDocumentsForm/>} />
    </Routes>
  );
}