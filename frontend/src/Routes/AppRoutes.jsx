import Header from "../components/Header/Header"
import Sidebar from "../components/Sidebar/Sidebar"

const AppRoutes = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full">
                <Header />
            </div>
        </div>
    )
}

export default AppRoutes;