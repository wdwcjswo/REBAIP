// next
import { useSession } from 'next-auth/react';
import avatar1 from 'assets/images/users/avatar-1.png';
import avatarThumb1 from 'assets/images/users/avatar-thumb-1.png';

export default function useUser() {
  const { data: session } = useSession();
  if (session) {
    const user = session?.user;
    const provider = session?.provider;
  let thumb = user?.image || avatar1;
    if (provider === 'cognito') {
      const email = user?.email?.split('@');
      user.name = email ? email[0] : 'Jone Doe';
    }

    if (!user?.image) {
      user.image = avatar1;
      thumb = avatarThumb1;
    }

    const newUser = {
      name: user?.name || 'Jone Doe',
      email: user?.email || 'doe@codedthemes.com',
      avatar: user?.image || avatar1,
      thumb,
      role: 'UI/UX Designer'
    };

    return newUser;
  }
  return false;
}
