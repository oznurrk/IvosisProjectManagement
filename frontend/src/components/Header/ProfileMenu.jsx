import { Menu,  Avatar } from '@mantine/core';


const ProfileMenu = () => {
  return (
    <Menu shadow='md' width={200}>
        <Menu.Target>
            <div className='flex items-center gap-3 cursor-pointer'>
                <span className='font-medium text-lg text-natural-900'>Bilgi İşlem</span>
                <Avatar variant='filled' src="avatar.png" size={50} alt='its me' />
            </div>
        </Menu.Target>
    </Menu>
  );
}
export default ProfileMenu;