import { ActionIcon } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
    return(
        <div className=" w-full h-12 flex justify-between px-5 items-center">
            <ActionIcon variant="transparent" size="xl" aria-label="Settings" >
                            <IconMenu2  style={{width:'70%',height:'70%'}} stroke={1.5} />
                        </ActionIcon>
            <ProfileMenu />
        </div>
    )
}

export default Header;