import { useState, useEffect } from 'react';
import { UserProfile, Recipe } from '../types';
import { storage } from '../utils/storage';
import { ArrowLeft, Users, UserPlus, UserMinus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RecipeCard } from './recipe-card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface UserProfileViewProps {
  userId: string;
  currentUserId: string | null;
  onBack: () => void;
  onRecipeClick: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string) => void;
}

export function UserProfileView({ 
  userId, 
  currentUserId,
  onBack, 
  onRecipeClick,
  onToggleFavorite 
}: UserProfileViewProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    // Load user profile
    const userProfile = storage.getUserById(userId);
    setUser(userProfile || null);

    // Load user's public recipes
    const allRecipes = storage.getRecipes();
    const userRecipes = allRecipes.filter(r => 
      r.authorId === userId && (r.isPublic || r.authorId === currentUserId)
    );
    setRecipes(userRecipes);

    // Check if current user is following this user
    if (currentUserId) {
      setIsFollowing(storage.isFollowing(currentUserId, userId));
    }

    // Get follower/following counts
    setFollowerCount(storage.getFollowerCount(userId));
    setFollowingCount(storage.getFollowingCount(userId));
  }, [userId, currentUserId]);

  const handleFollowToggle = () => {
    if (!currentUserId) {
      toast.error('Please log in to follow users');
      return;
    }

    if (currentUserId === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    if (isFollowing) {
      storage.removeFollow(currentUserId, userId);
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      toast.success(`Unfollowed ${user?.displayName}`);
    } else {
      storage.addFollow(currentUserId, userId);
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      toast.success(`Following ${user?.displayName}`);
      
      // Add activity
      storage.addActivity({
        userId: currentUserId,
        type: 'user_followed',
        targetId: userId,
      });
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-600">User not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="size-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;
  const publicRecipes = recipes.filter(r => r.isPublic);
  const privateRecipes = recipes.filter(r => !r.isPublic);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="size-24 md:size-32">
              <AvatarImage src={user.profileImage} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl mb-1">{user.displayName}</h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>

                {!isOwnProfile && currentUserId && (
                  <Button
                    onClick={handleFollowToggle}
                    variant={isFollowing ? 'outline' : 'default'}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="size-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-gray-700 mb-4">{user.bio}</p>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold">{publicRecipes.length}</span>
                  <span className="text-gray-600 ml-1">
                    {publicRecipes.length === 1 ? 'Recipe' : 'Recipes'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">{followerCount}</span>
                  <span className="text-gray-600 ml-1">
                    {followerCount === 1 ? 'Follower' : 'Followers'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">{followingCount}</span>
                  <span className="text-gray-600 ml-1">Following</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Tabs */}
      <Tabs defaultValue="public" className="w-full">
        <TabsList>
          <TabsTrigger value="public">
            Public Recipes ({publicRecipes.length})
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="private">
              Private Recipes ({privateRecipes.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="public" className="mt-6">
          {publicRecipes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="size-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No public recipes yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {publicRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onToggleFavorite={onToggleFavorite}
                  onClick={onRecipeClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="private" className="mt-6">
            {privateRecipes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">No private recipes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {privateRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onToggleFavorite={onToggleFavorite}
                    onClick={onRecipeClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
