import { useState, useEffect } from "react";
import {
  Avatar,
  Text,
  Button,
  Tooltip,
} from "@mantine/core";
import {
  IconClipboardText,
  IconLayoutGrid,
  IconLoader,
  IconSettings,
  IconSunElectricity,
  IconArrowBarLeft,
  IconArrowBarRight,
} from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", url: "/dashboard", icon: <IconLayoutGrid size={20} /> },

  {
    name: "Projeler",
    url: "/projects",
    icon: <IconSunElectricity size={20} />,
    children: [
      {
        name: "Görevlerim",
        url: "/my-tasks",
        icon: <IconSunElectricity size={18} />,
      },
    ],
  },

  { name: "Süreçler", url: "/processes", icon: <IconLoader size={20} /> },
  { name: "Belgeler", url: "/documents", icon: <IconClipboardText size={20} /> },
  { name: "Ayarlar", url: "/settings", icon: <IconSettings size={20} /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", role: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo({
          name: parsedUser.name || "Kullanıcı",
          role: parsedUser.role || "Rol Yok",
        });
      } catch {
        setUserInfo({ name: "Kullanıcı", role: "Rol Yok" });
      }
    }
  }, []);

  if (collapsed) {
    return (
      <div className="min-h-screen bg-ivosis-950 w-14 flex flex-col justify-between items-center">
        <div></div>
        <Tooltip label="Menüyü Aç" position="right">
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            onClick={() => setCollapsed(false)}
            className="mb-4"
          >
            <IconArrowBarRight size={18} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivosis-950 w-64 flex flex-col justify-between">
      {/* ÜST KISIM */}
      <div className="flex flex-col gap-6 items-center py-4 overflow-y-auto">
        {/* LOGO */}
        <img src="ivosislogo4.webp" alt="logo" className="w-48" />

        {/* AVATAR & KULLANICI BİLGİSİ */}
        <div className="flex flex-col gap-1 items-center">
          <div className="p-1 bg-white rounded-full shadow-lg">
            <Avatar variant="filled" src="avatar.png" size="xl" alt="avatar" />
          </div>
          <span className="font-medium text-white">{userInfo.name}</span>
          <Text c="dimmed" size="xs">{userInfo.role}</Text>
        </div>

        {/* MENÜ LİSTESİ */}
        <div className="flex flex-col gap-1 w-full px-4">
          {links.map((link) => (
            <div key={link.url} className="flex flex-col">
              <NavLink
                to={link.url}
                className={({ isActive }) =>
                  `flex items-center gap-3 font-medium text-white px-4 py-2 rounded-lg ${
                    isActive
                      ? "bg-ivosis-400 text-natural-950"
                      : "hover:bg-gray-100 hover:text-natural-950"
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>

              {link.children && (
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.url}
                      to={child.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-white text-sm px-4 py-1 rounded-md ${
                          isActive
                            ? "bg-ivosis-300 text-natural-900"
                            : "hover:bg-gray-100 hover:text-natural-900"
                        }`
                      }
                    >
                      {child.icon}
                      <span>{child.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ALTTAKİ MENÜYÜ KAPATMA */}
      <div className="flex justify-center py-3">
        <Button
          variant="light"
          size="xs"
          color="gray"
          onClick={() => setCollapsed(true)}
        >
          <IconArrowBarLeft size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
