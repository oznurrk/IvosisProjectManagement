import { ActionIcon, Avatar, Text } from "@mantine/core";
import { IconBurger, IconClipboardText, IconLayoutGrid, IconLayoutSidebarLeftCollapseFilled, IconLoader, IconMenu2, IconSettings, IconSunElectricity } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

const links = [
    {
        name:"Dashbord", url:"/dashboard", icon:<IconLayoutGrid stroke={1.5} />
    },
    {
        name:"Projeler", url:"/projects", icon:<IconSunElectricity stroke={1.5} />
    },
    {
        name:"Süreçler", url:"/processes", icon:<IconLoader stroke={1.5} />
    },
    {
        name:"Belgeler", url:"/documents", icon:<IconClipboardText stroke={1.5} />
    },
    {
        name:"Ayarlar", url:"/settings",icon:<IconSettings stroke={1.5} />
    }
]

const Sidebar = () => {
    return(
        <div className="w-64 h-screen bg-ivosis-950 flex flex-col gap-7 items-center py-3">
            <div className="text-red-500 flex gap-1 items-center">
                <img src="ivosislogo4.webp" alt="logo" className="w-48"/>
            </div>
            
            <div className="flex flex-col gap-1 items-center">
                <div className="p-1 bg-white rounded-full shadow-lg">
                    <Avatar variant="filled" src="avatar.png" size="xl" alt="its me" />
                </div>
                <span className="font-medium text-white">Bilgi İşlem</span>
                <Text c="dimmed" size="xs">Admin</Text>
            </div>
            <div className='flex flex-col gap-1'>
                        {
                            links.map((link) => {
                                return <NavLink to={link.url} key={link.url} className={({isActive}) => `flex items-center gap-3 w-full  font-medium text-white px-16 py-2 rounded-lg ${isActive?"bg-white text-natural-950":"hover:bg-gray-100 hover:text-natural-950"}`}>
                                    {link.icon}
                                    <span>{link.name}</span>
                                </NavLink>
                            })
                        }
            </div>
            
        </div>
    )
}

export default Sidebar;