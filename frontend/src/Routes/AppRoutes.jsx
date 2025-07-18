import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "../Layout/AdminDashboard";
import Projects from "../pages/Projects";
import Random from "../components/Header/Random";
import ProjectCreated from "../pages/ProjectCreated";
import ProjectTasks from "../components/Project/ProjectTasks";
import MyTasks from "../pages/MyTasks";
import Login from "../pages/Login";
import TaskChat from "../components/TaskChat/TaskChat";
import Processes from "../pages/Processes";
import ProcessAdd from "../components/Process/ProcessAdd";
import TaskAdd from "../components/Tasks/TaskAdd";
import ProjectProcessTaskSelectModal from "../components/Project/ProjectProcessTaskSelectModal";


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
                    <Route path="//my-tasks" element={<MyTasks />} />
                    <Route path="/taskChat" element={<TaskChat />} />
                    <Route path="/processes" element={<Processes />} />
                    <Route path="/add-process" element={<ProcessAdd />} />
                    <Route path="/add-task" element={<TaskAdd />} />
                    <Route path="/project-process/:processId" element={<ProjectProcessTaskSelectModal />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;

