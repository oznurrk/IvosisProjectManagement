import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "../Layout/AdminDashboard";
import ProductionDashboard from "../pages/Production.jsx";
import LotManagement from "../pages/LotManagement.jsx";
import Projects from "../pages/Projects";
import Random from "../components/Header/Random";
import ProjectCreated from "../pages/ProjectCreated";
import ProjectTasks from "../components/Project/ProjectTasks";
import MyTasks from "../pages/MyTasks";
import Login from "../pages/Login";
import Processes from "../pages/Processes";
import TaskAdd from "../components/Tasks/TaskAdd";
import Dashboard from "../pages/Dashboard";
import PersonnelListPage from "../pages/PersonnelListPage";
import StockManagement from "../pages/StockManagement";
import StockCards from "../pages/StockCards";
import StockMovements from "../pages/StockMovements";
import IncomingInvoices from "../pages/IncomingInvoices";
import EInvoiceDashboard from "../pages/EInvoiceDashboard";
import Buying from "../pages/Buying";
import Offers from "../components/Buying/Offers";
import Orders from "../components/Buying/Orders";
import Demands from "../components/Buying/Demands";

const AppRoutes = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/" element={<AdminDashboard />}>
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/documents" element={<Random />} />
                    <Route path="/settings" element={<Random />} />
                    <Route path="/projectCreated" element={<ProjectCreated />} />
                    <Route path="/projectTasks" element={<ProjectTasks />} />
                    <Route path="/my-tasks" element={<MyTasks />} />
                    <Route path="/processes" element={<Processes />} />
                    <Route path="/stock-management" element={<StockManagement />} />
                    <Route path="/production" element={<ProductionDashboard />} />
                    <Route path="/lot-management" element={<LotManagement />} />
                    <Route path="/add-task" element={<TaskAdd />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/users" element={<PersonnelListPage  />} />
                    <Route path="/stock-cards" element={<StockCards />} />
                    <Route path="/stock-movements" element={<StockMovements />} />
                    <Route path="/e-invoices" element={<IncomingInvoices />} />
                    <Route path="/incoming-invoices" element={<IncomingInvoices />} />
                    <Route path="/e-invoice-dashboard" element={<EInvoiceDashboard />} />
                    <Route path="/waybills" element={<Random />} />
                    <Route path="/buying" element={<Buying />} />
                    <Route path="/demands" element={<Demands />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/orders" element={<Orders />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;

