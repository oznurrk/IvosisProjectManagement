import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "../Layout/AdminDashboard";
import Projects from "../pages/Projects";


const AppRoutes = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AdminDashboard />}>
                    <Route path="/dashboard" element={<Projects />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/processes" element={<Projects />} />
                    <Route path="/documents" element={<Projects />} />
                    <Route path="/settings" element={<Projects />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;