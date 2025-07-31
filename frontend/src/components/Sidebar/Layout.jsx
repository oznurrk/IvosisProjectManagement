import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
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
      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      {/* Main Content */}
      <div 
        className={`
          flex-1 flex flex-col
          ${isMobile ? 'w-full' : ''}
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Children'a mobile menu props'larını geçir */}
            {typeof children === 'function' 
              ? children({ 
                  isMobile, 
                  isMobileMenuOpen, 
                  setIsMobileMenuOpen 
                })
              : children
            }
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;