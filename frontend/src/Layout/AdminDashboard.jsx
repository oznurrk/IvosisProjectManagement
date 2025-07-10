import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar/Sidebar"

const AdminDashboard = () => {
    return(
        <div className="flex">
            <Sidebar />
            <div className="w-full">
             {/*   <Header /> */}
                <Outlet />
            </div>
        </div>
    )
}

export default AdminDashboard;