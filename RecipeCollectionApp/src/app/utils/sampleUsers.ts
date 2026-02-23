import { UserProfile } from '../types';

export const sampleUsers: UserProfile[] = [
  {
    id: 'user1',
    username: 'chef_maria',
    displayName: 'Maria Rodriguez',
    bio: 'Home chef passionate about Italian cuisine and baking. Sharing my family recipes! 🍝',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    dateJoined: Date.now() - 86400000 * 90,
  },
  {
    id: 'user2',
    username: 'healthy_eats',
    displayName: 'Sarah Chen',
    bio: 'Nutrition coach | Plant-based recipes | Making healthy eating delicious 🥗',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    dateJoined: Date.now() - 86400000 * 60,
  },
  {
    id: 'user3',
    username: 'baker_bob',
    displayName: 'Bob Williams',
    bio: 'Professional baker sharing secrets from my 20 years in the kitchen 🍰',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    dateJoined: Date.now() - 86400000 * 120,
  },
  {
    id: 'user4',
    username: 'asian_fusion',
    displayName: 'Li Wei',
    bio: 'Exploring Asian flavors with a modern twist 🍜',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    dateJoined: Date.now() - 86400000 * 45,
  },
];
