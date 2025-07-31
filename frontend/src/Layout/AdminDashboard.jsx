import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";

const AdminDashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            
            // Desktop'a geçerken mobile menüyü kapat
            if (!mobile) {
                setIsMobileMenuOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar 
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <div className="flex-1 w-full">
                <Outlet context={{ 
                    isMobile, 
                    isMobileMenuOpen, 
                    setIsMobileMenuOpen 
                }} />
            </div>
        </div>
    );
};

export default AdminDashboard;