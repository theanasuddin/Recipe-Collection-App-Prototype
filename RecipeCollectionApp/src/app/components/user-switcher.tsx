import { UserSession, UserProfile } from '../types';
import { storage } from '../utils/storage';
import { LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface UserSwitcherProps {
  currentUser: UserSession | null;
  onLogin: (userId: string) => void;
  onLogout: () => void;
  onViewProfile: (userId: string) => void;
}

export function UserSwitcher({ currentUser, onLogin, onLogout, onViewProfile }: UserSwitcherProps) {
  const users = storage.getUsers();

  const handleLogin = (user: UserProfile) => {
    onLogin(user.id);
    toast.success(`Logged in as ${user.displayName}`);
  };

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out');
  };

  if (!currentUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <LogIn className="size-4 mr-2" />
            Login
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Choose a user</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {users.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => handleLogin(user)}
              className="cursor-pointer"
            >
              <Avatar className="size-6 mr-2">
                <AvatarImage src={user.profileImage} alt={user.displayName} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{user.displayName}</div>
                <div className="text-xs text-gray-500">@{user.username}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const user = storage.getUserById(currentUser.userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Avatar className="size-6">
            <AvatarImage src={user?.profileImage} alt={currentUser.displayName} />
            <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{currentUser.displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewProfile(currentUser.userId)} className="cursor-pointer">
          <User className="size-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
