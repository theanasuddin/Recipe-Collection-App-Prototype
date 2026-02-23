import { Recipe, Collection, UserProfile, Follow, Like, Activity, UserSession } from '../types';

const STORAGE_KEYS = {
  RECIPES: 'recipeApp_recipes',
  COLLECTIONS: 'recipeApp_collections',
  USERS: 'recipeApp_users',
  FOLLOWS: 'recipeApp_follows',
  LIKES: 'recipeApp_likes',
  ACTIVITIES: 'recipeApp_activities',
  CURRENT_USER: 'recipeApp_currentUser',
};

export const storage = {
  // Recipes
  getRecipes: (): Recipe[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return data ? JSON.parse(data) : [];
  },

  saveRecipes: (recipes: Recipe[]): void => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  },

  addRecipe: (recipe: Recipe): void => {
    const recipes = storage.getRecipes();
    recipes.push(recipe);
    storage.saveRecipes(recipes);
  },

  updateRecipe: (id: string, updatedRecipe: Recipe): void => {
    const recipes = storage.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      recipes[index] = updatedRecipe;
      storage.saveRecipes(recipes);
    }
  },

  deleteRecipe: (id: string): void => {
    const recipes = storage.getRecipes().filter(r => r.id !== id);
    storage.saveRecipes(recipes);
  },

  // Collections
  getCollections: (): Collection[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveCollections: (collections: Collection[]): void => {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  },

  addCollection: (collection: Collection): void => {
    const collections = storage.getCollections();
    collections.push(collection);
    storage.saveCollections(collections);
  },

  updateCollection: (id: string, updatedCollection: Collection): void => {
    const collections = storage.getCollections();
    const index = collections.findIndex(c => c.id === id);
    if (index !== -1) {
      collections[index] = updatedCollection;
      storage.saveCollections(collections);
    }
  },

  deleteCollection: (id: string): void => {
    const collections = storage.getCollections().filter(c => c.id !== id);
    storage.saveCollections(collections);
  },

  // NEW: Users
  getUsers: (): UserProfile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: UserProfile[]): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUserById: (id: string): UserProfile | undefined => {
    return storage.getUsers().find(u => u.id === id);
  },

  // NEW: Current User Session
  getCurrentUser: (): UserSession | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: UserSession | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // NEW: Follows
  getFollows: (): Follow[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FOLLOWS);
    return data ? JSON.parse(data) : [];
  },

  saveFollows: (follows: Follow[]): void => {
    localStorage.setItem(STORAGE_KEYS.FOLLOWS, JSON.stringify(follows));
  },

  isFollowing: (followerId: string, followingId: string): boolean => {
    const follows = storage.getFollows();
    return follows.some(f => f.followerId === followerId && f.followingId === followingId);
  },

  addFollow: (followerId: string, followingId: string): void => {
    if (followerId === followingId) return; // Cannot follow self
    if (storage.isFollowing(followerId, followingId)) return; // Already following

    const follow: Follow = {
      id: Date.now().toString(),
      followerId,
      followingId,
      dateFollowed: Date.now(),
    };
    const follows = storage.getFollows();
    follows.push(follow);
    storage.saveFollows(follows);
  },

  removeFollow: (followerId: string, followingId: string): void => {
    const follows = storage.getFollows().filter(
      f => !(f.followerId === followerId && f.followingId === followingId)
    );
    storage.saveFollows(follows);
  },

  getFollowerCount: (userId: string): number => {
    return storage.getFollows().filter(f => f.followingId === userId).length;
  },

  getFollowingCount: (userId: string): number => {
    return storage.getFollows().filter(f => f.followerId === userId).length;
  },

  getFollowing: (userId: string): string[] => {
    return storage.getFollows()
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
  },

  // NEW: Likes
  getLikes: (): Like[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LIKES);
    return data ? JSON.parse(data) : [];
  },

  saveLikes: (likes: Like[]): void => {
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
  },

  hasLiked: (userId: string, recipeId: string): boolean => {
    const likes = storage.getLikes();
    return likes.some(l => l.userId === userId && l.recipeId === recipeId);
  },

  addLike: (userId: string, recipeId: string): void => {
    if (storage.hasLiked(userId, recipeId)) return; // Already liked

    const like: Like = {
      id: Date.now().toString(),
      userId,
      recipeId,
      dateLiked: Date.now(),
    };
    const likes = storage.getLikes();
    likes.push(like);
    storage.saveLikes(likes);
  },

  removeLike: (userId: string, recipeId: string): void => {
    const likes = storage.getLikes().filter(
      l => !(l.userId === userId && l.recipeId === recipeId)
    );
    storage.saveLikes(likes);
  },

  getLikeCount: (recipeId: string): number => {
    return storage.getLikes().filter(l => l.recipeId === recipeId).length;
  },

  // NEW: Activities
  getActivities: (): Activity[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  },

  saveActivities: (activities: Activity[]): void => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>): void => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const activities = storage.getActivities();
    activities.unshift(newActivity); // Add to beginning
    storage.saveActivities(activities);
  },

  getFeed: (userId: string, limit: number = 10, offset: number = 0): Activity[] => {
    const following = storage.getFollowing(userId);
    const activities = storage.getActivities();
    
    // Get activities from users being followed
    const feedActivities = activities.filter(a => following.includes(a.userId));
    
    // Sort by timestamp (newest first) and paginate
    return feedActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);
  },
};