import { useState, useEffect } from 'react';
import { Activity, Recipe, UserProfile } from '../types';
import { storage } from '../utils/storage';
import { Heart, ChefHat, UserPlus, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  currentUserId: string;
  onUserClick: (userId: string) => void;
  onRecipeClick: (recipeId: string) => void;
}

export function ActivityFeed({ currentUserId, onUserClick, onRecipeClick }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadActivities();
  }, [currentUserId, page]);

  const loadActivities = () => {
    const feed = storage.getFeed(currentUserId, ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    
    if (page === 0) {
      setActivities(feed);
    } else {
      setActivities(prev => [...prev, ...feed]);
    }
    
    setHasMore(feed.length === ITEMS_PER_PAGE);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getActivityContent = (activity: Activity) => {
    const user = storage.getUserById(activity.userId);
    if (!user) return null;

    switch (activity.type) {
      case 'recipe_published': {
        const recipe = storage.getRecipes().find(r => r.id === activity.targetId);
        if (!recipe) return null;

        return (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  className="size-10 cursor-pointer"
                  onClick={() => onUserClick(user.id)}
                >
                  <AvatarImage src={user.profileImage} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="size-4 text-blue-600 flex-shrink-0" />
                    <p className="text-sm">
                      <button
                        onClick={() => onUserClick(user.id)}
                        className="font-semibold hover:underline"
                      >
                        {user.displayName}
                      </button>
                      <span className="text-gray-600"> published a new recipe</span>
                    </p>
                  </div>

                  <div
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => onRecipeClick(recipe.id)}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="size-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{recipe.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="size-3" />
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      case 'recipe_liked': {
        const recipe = storage.getRecipes().find(r => r.id === activity.targetId);
        if (!recipe) return null;

        return (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  className="size-10 cursor-pointer"
                  onClick={() => onUserClick(user.id)}
                >
                  <AvatarImage src={user.profileImage} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="size-4 text-red-500 fill-current flex-shrink-0" />
                    <p className="text-sm">
                      <button
                        onClick={() => onUserClick(user.id)}
                        className="font-semibold hover:underline"
                      >
                        {user.displayName}
                      </button>
                      <span className="text-gray-600"> liked </span>
                      <button
                        onClick={() => onRecipeClick(recipe.id)}
                        className="font-medium hover:underline"
                      >
                        {recipe.title}
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="size-3" />
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      case 'user_followed': {
        const targetUser = storage.getUserById(activity.targetId);
        if (!targetUser) return null;

        return (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  className="size-10 cursor-pointer"
                  onClick={() => onUserClick(user.id)}
                >
                  <AvatarImage src={user.profileImage} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="size-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm">
                      <button
                        onClick={() => onUserClick(user.id)}
                        className="font-semibold hover:underline"
                      >
                        {user.displayName}
                      </button>
                      <span className="text-gray-600"> started following </span>
                      <button
                        onClick={() => onUserClick(targetUser.id)}
                        className="font-semibold hover:underline"
                      >
                        {targetUser.displayName}
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="size-3" />
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      default:
        return null;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <ChefHat className="size-12 mx-auto text-gray-400 mb-3" />
            <h3 className="font-semibold mb-2">No Activity Yet</h3>
            <p className="text-sm text-gray-600">
              Follow other users to see their activity in your feed
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl mb-4">Activity Feed</h2>
      
      {activities.map((activity) => (
        <div key={activity.id}>
          {getActivityContent(activity)}
        </div>
      ))}

      {hasMore && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
