import { useEffect, useState } from "react";
import { Avatar, Text, Button, Tooltip } from "@mantine/core";
import {
  IconClipboardText,
  IconLayoutGrid,
  IconLoader,
  IconSettings,
  IconSunElectricity,
  IconArrowBarLeft,
  IconArrowBarRight,
  IconLogout,
  IconCalendarUser,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: "Yükleniyor...", role: "..." });

  const links = [
    { name: "Dashboard", url: "/dashboard", icon: <IconLayoutGrid size={20} /> },
    { 
      name: "İnsan Kaynakları", 
      url: "/", 
      icon: <IconUserCircle size={20} />,
      children: [
        {
          name: "Personel Listesi",
          url: "/users",
          icon: <IconUsers size={20} />,
        },
      ]
    },
    {
      name: "Projeler",
      url: "/projects",
      icon: <IconSunElectricity size={20} />,
      children: [
        {
          name: "Görevlerim",
          url: "/my-tasks",
          icon: <IconCalendarUser size={20} />,
        },
      ],
    },
    { name: "Süreçler", url: "/processes", icon: <IconLoader size={20} /> },
    { name: "Belgeler", url: "/documents", icon: <IconClipboardText size={20} /> },
    { name: "Ayarlar", url: "/settings", icon: <IconSettings size={20} /> },
    { name: "Çıkış Yap", url: "/#", icon: <IconLogout size={20} /> }
  ];

  // Kullanıcı bilgilerini localStorage'dan al
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserInfo({ 
          name: user.name || "Kullanıcı", 
          role: user.role || "Rol Yok" 
        });
      } catch {
        setUserInfo({ name: "Kullanıcı", role: "Rol Yok" });
      }
    }
  }, []);

  // Ekran boyutu değişikliklerini takip et
  useEffect(() => {
    const checkScreenSize = () => {
      const windowWidth = window.innerWidth;
      const mobile = windowWidth < 768;
      const desktop = windowWidth >= 1024;
      
      setIsMobile(mobile);
      setIsDesktop(desktop);
      
      // Mobilde otomatik olarak collapse et, desktop'ta durumu koru
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // collapsed dependency'sini kaldırdık

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  // Double click handler'ı düzelttik
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  // Mobile overlay click handler
  const handleOverlayClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  // Collapsed sidebar
  if (collapsed) {
    return (
      <div
        onDoubleClick={handleDoubleClick}
        className={`
          min-h-screen bg-ivosis-950 flex flex-col justify-between items-center
          ${isMobile ? 'fixed left-0 top-0 z-50 w-16' : 'w-16'}
          transition-all duration-300 ease-in-out
        `}
        style={{
          background: "linear-gradient(180deg, #24809c 0%, #112d3b 100%)",
          color: "white"
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center py-4 w-full">
          <Tooltip label="Menüyü Aç" position="right">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={toggleSidebar}
              className="mb-4 hover:bg-white/10"
            >
              <IconArrowBarRight size={18} />
            </Button>
          </Tooltip>

          {/* Collapsed Navigation Icons */}
          <div className="flex flex-col gap-2 w-full items-center">
            {links.map((link) => (
              <div key={link.url} className="w-full flex flex-col items-center">
                <Tooltip label={link.name} position="right">
                  <NavLink
                    to={link.url}
                    className={({ isActive }) =>
                      `flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                        isActive
                          ? "bg-ivosis-400 text-natural-950"
                          : "hover:bg-white/10 text-white"
                      }`
                    }
                  >
                    {link.icon}
                  </NavLink>
                </Tooltip>
                
                {/* Child links için küçük gösterge */}
                {link.children && (
                  <div className="mt-1 flex flex-col gap-1 items-center">
                    {link.children.map((child) => (
                      <Tooltip key={child.url} label={child.name} position="right">
                        <NavLink
                          to={child.url}
                          className={({ isActive }) =>
                            `flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                              isActive
                                ? "bg-ivosis-300 text-natural-900"
                                : "hover:bg-white/10 text-white/80"
                            }`
                          }
                        >
                          {child.icon}
                        </NavLink>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Collapsed User Avatar */}
        <div className="py-3">
          <Tooltip label={userInfo.name} position="right">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <Avatar variant="filled" size="sm" alt="avatar" />
            </div>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Expanded sidebar
  return (
    <>
      {/* Mobile overlay - sadece mobilde ve sidebar açıkken göster */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleOverlayClick}
        />
      )}

      <div
        onDoubleClick={handleDoubleClick}
        className={`
          min-h-screen bg-ivosis-950 flex flex-col justify-between
          ${isMobile 
            ? 'fixed left-0 top-0 z-50 w-64' 
            : 'w-64'
          }
          transition-all duration-300 ease-in-out
        `}
        style={{
          background: "linear-gradient(180deg, #24809c 0%, #112d3b 100%)",
          color: "white",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 py-4 overflow-y-auto flex-1">
          {/* Logo */}
          <div className="w-full flex justify-center px-4">
            <img 
              src="ivosislogo4.webp" 
              alt="logo" 
              className="w-32 sm:w-40 object-contain" 
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-2 items-center px-4">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <Avatar variant="filled" size="lg" alt="avatar" />
            </div>
            <div className="text-center">
              <div className="font-medium text-white text-sm">
                {userInfo.name}
              </div>
              <Text c="dimmed" size="xs">
                {userInfo.role}
              </Text>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-1 w-full px-4 flex-1">
            {links.map((link) => (
              <div key={link.url} className="flex flex-col">
                <NavLink
                  to={link.url}
                  className={({ isActive }) =>
                    `flex items-center gap-3 font-medium text-white px-3 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-ivosis-400 text-natural-950"
                        : "hover:bg-white/10"
                    }`
                  }
                  onClick={() => {
                    // Mobilde link tıklandığında sidebar'ı kapat
                    if (isMobile) {
                      setCollapsed(true);
                    }
                  }}
                >
                  {link.icon}
                  <span className="truncate">{link.name}</span>
                </NavLink>

                {/* Child Navigation */}
                {link.children && (
                  <div className="ml-6 mt-1 flex flex-col gap-1">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.url}
                        to={child.url}
                        className={({ isActive }) =>
                          `flex items-center gap-2 text-white px-3 py-2 rounded-md transition-colors text-xs ${
                            isActive
                              ? "bg-ivosis-300 text-natural-900"
                              : "hover:bg-white/10"
                          }`
                        }
                        onClick={() => {
                          // Mobilde link tıklandığında sidebar'ı kapat
                          if (isMobile) {
                            setCollapsed(true);
                          }
                        }}
                      >
                        {child.icon}
                        <span className="truncate">{child.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Collapse Button */}
        <div className="flex justify-center py-4 border-t border-white/10">
          <Button
            variant="light"
            size="xs"
            color="gray"
            onClick={toggleSidebar}
            className="hover:bg-white/20"
          >
            <IconArrowBarLeft size={18} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;