export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  scalable: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  category: string;
  image: string;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  isFavorite: boolean;
  dateAdded: number;
  isPublic: boolean; // NEW: visibility toggle
  authorId: string; // NEW: recipe owner
  likeCount: number; // NEW: like count
}

export interface Collection {
  id: string;
  name: string;
  recipeIds: string[];
  dateCreated: number;
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  scalable: boolean;
  recipeIds: string[];
}

// NEW: User Profile
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  dateJoined: number;
}

// NEW: Follow Relationship
export interface Follow {
  id: string;
  followerId: string; // user who follows
  followingId: string; // user being followed
  dateFollowed: number;
}

// NEW: Like
export interface Like {
  id: string;
  userId: string;
  recipeId: string;
  dateLiked: number;
}

// NEW: Activity
export interface Activity {
  id: string;
  userId: string;
  type: 'recipe_published' | 'recipe_liked' | 'user_followed';
  targetId: string; // recipe ID or user ID
  timestamp: number;
}

// NEW: Current User Session
export interface UserSession {
  userId: string;
  username: string;
  displayName: string;
}