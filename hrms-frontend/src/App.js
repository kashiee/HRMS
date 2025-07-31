import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Roles from './pages/Roles';
import Bureau from './pages/Bureau';
import BureauCompanyDetails from './pages/BureauCompanyDetails';
import BureauCompanyEdit from './pages/BureauCompanyEdit';
import AddCompany from './pages/AddCompany';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerCompanyDetails from './pages/EmployerCompanyDetails';
import Company from './pages/Company';
import CompanyDetails from './pages/CompanyDetails';
import CompanyDepartments from './pages/CompanyDepartments';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import EmployeeEdit from './pages/EmployeeEdit';
import Payroll from './pages/Payroll';
import './styles/globals.css';

function App() {
  return (
    <Router>
    <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/bureau" element={<Bureau />} />
            <Route path="/bureau/company/:companyId" element={<BureauCompanyDetails />} />
            <Route path="/bureau/company/:companyId/edit" element={<BureauCompanyEdit />} />
            <Route path="/add-company" element={<AddCompany />} />
            <Route path="/employer/:companyId" element={<EmployerDashboard />} />
            <Route path="/employer/:companyId/details" element={<EmployerCompanyDetails />} />
            <Route path="/company" element={<Company />} />
            <Route path="/company/:companyId" element={<CompanyDetails />} />
            <Route path="/company/:companyId/departments" element={<CompanyDepartments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employee/:employeeReference" element={<EmployeeDetails />} />
            <Route path="/employee/:employeeReference/edit" element={<EmployeeEdit />} />
            <Route path="/payroll" element={<Payroll />} />
          </Routes>
        </main>
    </div>
    </Router>
  );
}

export default App;
