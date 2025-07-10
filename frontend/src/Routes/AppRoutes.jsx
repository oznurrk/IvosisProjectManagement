import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "../Layout/AdminDashboard";
import Projects from "../pages/Projects";
import Random from "../components/Header/Random";
import ProjectCreated from "../pages/ProjectCreated";
import ProjectDetails from "../pages/ProjectDetails";
import ProjectTasks from "../components/Project/ProjectTasks";
import MyTasks from "../pages/MyTasks";
import Login from "../pages/Login";
import TaskChat from "../components/TaskChat/TaskChat";


const AppRoutes = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/" element={<AdminDashboard />}>
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/processes" element={<Random />} />
                    <Route path="/documents" element={<Random />} />
                    <Route path="/settings" element={<Random />} />
                    <Route path="/projectCreated" element={<ProjectCreated />} />
                    <Route path="/projectDetails/:id" element={<ProjectDetails />} />
                    <Route path="/projectTasks" element={<ProjectTasks />} />
                    <Route path="//my-tasks/:id" element={<MyTasks />} />
                    <Route path="/taskChat" element={<TaskChat />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;

