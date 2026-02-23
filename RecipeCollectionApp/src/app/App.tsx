import { useState, useEffect, useMemo } from 'react';
import { Recipe, Collection, UserSession } from './types';
import { storage } from './utils/storage';
import { sampleRecipes } from './utils/sampleData';
import { sampleUsers } from './utils/sampleUsers';
import { RecipeCard } from './components/recipe-card';
import { RecipeDetail } from './components/recipe-detail';
import { RecipeForm } from './components/recipe-form';
import { ShareModal } from './components/share-modal';
import { ShoppingList } from './components/shopping-list';
import { ImportRecipe } from './components/import-recipe';
import { CollectionsManager } from './components/collections-manager';
import { UserSwitcher } from './components/user-switcher';
import { UserProfileView } from './components/user-profile-view';
import { ActivityFeed } from './components/activity-feed';
import { 
  Search, 
  Plus, 
  Heart, 
  ShoppingCart, 
  Upload,
  Grid3x3,
  List,
  Filter,
  X,
  Menu,
  ChevronLeft,
  Activity
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { Toaster } from './components/ui/sonner';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';

type ViewMode = 'library' | 'detail' | 'edit' | 'add' | 'import' | 'shopping' | 'profile' | 'feed';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'collections'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedRecipes = storage.getRecipes();
    if (storedRecipes.length === 0) {
      // Initialize with sample data
      storage.saveRecipes(sampleRecipes);
      setRecipes(sampleRecipes);
    } else {
      setRecipes(storedRecipes);
    }

    // Initialize sample users if not present
    const storedUsers = storage.getUsers();
    if (storedUsers.length === 0) {
      storage.saveUsers(sampleUsers);
    }

    const storedCollections = storage.getCollections();
    setCollections(storedCollections);

    // Load current user session
    const savedUser = storage.getCurrentUser();
    setCurrentUser(savedUser);
  }, []);

  // Get all unique tags from recipes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [recipes]);

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by active tab
    if (activeTab === 'favorites') {
      filtered = filtered.filter(r => r.isFavorite);
    } else if (activeTab === 'collections' && selectedCollection) {
      filtered = filtered.filter(r => selectedCollection.recipeIds.includes(r.id));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(r =>
        selectedTags.every(tag => r.tags.includes(tag))
      );
    }

    // Sort
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered = [...filtered].sort((a, b) => b.dateAdded - a.dateAdded);
    }

    return filtered;
  }, [recipes, activeTab, selectedCollection, searchQuery, selectedTags, sortBy]);

  // Handlers
  const handleToggleFavorite = (id: string) => {
    const updated = recipes.map(r =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    setRecipes(updated);
    storage.saveRecipes(updated);
    
    if (selectedRecipe?.id === id) {
      setSelectedRecipe({ ...selectedRecipe, isFavorite: !selectedRecipe.isFavorite });
    }
  };

  const handleSelectRecipe = (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      setSelectedRecipe(recipe);
      setViewMode('detail');
    }
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const existing = recipes.find(r => r.id === recipe.id);
    if (existing) {
      const updated = recipes.map(r => r.id === recipe.id ? recipe : r);
      setRecipes(updated);
      storage.saveRecipes(updated);
      setSelectedRecipe(recipe);
      setViewMode('detail');
    } else {
      const updated = [...recipes, recipe];
      setRecipes(updated);
      storage.saveRecipes(updated);
      setViewMode('library');
    }
  };

  const handleImportRecipe = (recipe: Recipe) => {
    const updated = [...recipes, recipe];
    setRecipes(updated);
    storage.saveRecipes(updated);
    setViewMode('library');
  };

  const handleToggleRecipeSelection = (id: string) => {
    setSelectedRecipeIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateCollection = (name: string) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      recipeIds: [],
      dateCreated: Date.now(),
    };
    const updated = [...collections, newCollection];
    setCollections(updated);
    storage.saveCollections(updated);
  };

  const handleRenameCollection = (id: string, newName: string) => {
    const updated = collections.map(c =>
      c.id === id ? { ...c, name: newName } : c
    );
    setCollections(updated);
    storage.saveCollections(updated);
    
    if (selectedCollection?.id === id) {
      setSelectedCollection({ ...selectedCollection, name: newName });
    }
  };

  const handleDeleteCollection = (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    storage.saveCollections(updated);
    
    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
    }
  };

  const handleAddToCollection = (collectionId: string, recipeId: string) => {
    const updated = collections.map(c =>
      c.id === collectionId && !c.recipeIds.includes(recipeId)
        ? { ...c, recipeIds: [...c.recipeIds, recipeId] }
        : c
    );
    setCollections(updated);
    storage.saveCollections(updated);
  };

  const handleRemoveFromCollection = (collectionId: string, recipeId: string) => {
    const updated = collections.map(c =>
      c.id === collectionId
        ? { ...c, recipeIds: c.recipeIds.filter(id => id !== recipeId) }
        : c
    );
    setCollections(updated);
    storage.saveCollections(updated);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // User session handlers
  const handleLogin = (userId: string) => {
    const user = storage.getUserById(userId);
    if (user) {
      const session: UserSession = {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
      };
      setCurrentUser(session);
      storage.setCurrentUser(session);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.setCurrentUser(null);
  };

  const handleViewProfile = (userId: string) => {
    setViewingUserId(userId);
    setViewMode('profile');
  };

  // Render view based on mode
  if (viewMode === 'detail' && selectedRecipe) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 p-6">
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setViewMode('library')}
            onEdit={() => setViewMode('edit')}
            onToggleFavorite={handleToggleFavorite}
            onShare={() => setShareModalOpen(true)}
          />
        </div>
        <ShareModal
          recipe={selectedRecipe}
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
        />
        <Toaster />
      </>
    );
  }

  if (viewMode === 'edit' && selectedRecipe) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <RecipeForm
          recipe={selectedRecipe}
          onSave={handleSaveRecipe}
          onCancel={() => setViewMode('detail')}
        />
        <Toaster />
      </div>
    );
  }

  if (viewMode === 'add') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <RecipeForm
          onSave={handleSaveRecipe}
          onCancel={() => setViewMode('library')}
        />
        <Toaster />
      </div>
    );
  }

  if (viewMode === 'import') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ImportRecipe
          onBack={() => setViewMode('library')}
          onImport={handleImportRecipe}
        />
        <Toaster />
      </div>
    );
  }

  if (viewMode === 'shopping') {
    const shoppingRecipes = recipes.filter(r => selectedRecipeIds.includes(r.id));
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ShoppingList
          recipes={shoppingRecipes}
          onBack={() => {
            setViewMode('library');
            setSelectedRecipeIds([]);
          }}
        />
        <Toaster />
      </div>
    );
  }

  if (viewMode === 'profile' && viewingUserId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <UserProfileView
          userId={viewingUserId}
          currentUserId={currentUser?.userId || null}
          onBack={() => {
            setViewingUserId(null);
            setViewMode('library');
          }}
          onRecipeClick={handleSelectRecipe}
          onToggleFavorite={handleToggleFavorite}
        />
        <Toaster />
      </div>
    );
  }

  if (viewMode === 'feed' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => setViewMode('library')}>
              <ChevronLeft className="size-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Activity Feed</h1>
          </div>
          <ActivityFeed
            currentUserId={currentUser.userId}
            onUserClick={handleViewProfile}
            onRecipeClick={handleSelectRecipe}
          />
        </div>
        <Toaster />
      </div>
    );
  }

  // Library view
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl">My Recipe Collection</h1>
            <div className="flex gap-2">
              {currentUser && (
                <Button variant="outline" size="sm" onClick={() => setViewMode('feed')}>
                  <Activity className="size-4 md:mr-2" />
                  <span className="hidden md:inline">Feed</span>
                </Button>
              )}
              <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => setViewMode('import')}>
                <Upload className="size-4 mr-2" />
                Import
              </Button>
              <Button size="sm" onClick={() => setViewMode('add')}>
                <Plus className="size-4 mr-2" />
                <span className="hidden sm:inline">Add Recipe</span>
              </Button>
              <UserSwitcher
                currentUser={currentUser}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onViewProfile={handleViewProfile}
              />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  placeholder="Search recipes by name or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="size-4 md:mr-2" />
                    <span className="hidden md:inline">Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[100px] md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs - Now responsive */}
            <div className="flex items-center gap-3">
              <Tabs value={activeTab} onValueChange={(v: any) => {
                setActiveTab(v);
                setSelectedCollection(null);
              }} className="flex-1">
                <TabsList className="w-full grid grid-cols-3 h-10">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-1">
                    <Heart className="size-4" />
                    <span className="hidden sm:inline">Favorites</span>
                  </TabsTrigger>
                  <TabsTrigger value="collections">Lists</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Mobile Collections Toggle */}
              {activeTab === 'collections' && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Menu className="size-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="mt-6">
                      <CollectionsManager
                        collections={collections}
                        onCreateCollection={handleCreateCollection}
                        onRenameCollection={handleRenameCollection}
                        onDeleteCollection={handleDeleteCollection}
                        onSelectCollection={(collection) => {
                          setSelectedCollection(collection);
                          setSidebarOpen(false);
                        }}
                        selectedCollectionId={selectedCollection?.id}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Active Filters */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleToggleTag(tag)}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop Only for Collections */}
          {activeTab === 'collections' && (
            <div className="hidden md:block w-64 flex-shrink-0">
              <CollectionsManager
                collections={collections}
                onCreateCollection={handleCreateCollection}
                onRenameCollection={handleRenameCollection}
                onDeleteCollection={handleDeleteCollection}
                onSelectCollection={setSelectedCollection}
                selectedCollectionId={selectedCollection?.id}
              />
              
              {/* Shopping List Section */}
              {selectedRecipeIds.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="size-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {selectedRecipeIds.length} selected
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRecipeIds([])}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setViewMode('shopping')}
                  >
                    Generate Shopping List
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Recipe Grid */}
          <div className="flex-1">
            {/* Shopping List Sticky Banner - Mobile */}
            {selectedRecipeIds.length > 0 && (
              <div className="md:hidden mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="size-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {selectedRecipeIds.length} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipeIds([])}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setViewMode('shopping')}
                >
                  Generate Shopping List
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
              </p>
              {selectedRecipeIds.length === 0 && (
                <p className="text-xs md:text-sm text-gray-500">
                  <span className="hidden md:inline">Click recipes to select for shopping list</span>
                  <span className="md:hidden">Tap to select</span>
                </p>
              )}
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No recipes found</p>
                <Button onClick={() => setViewMode('add')}>
                  <Plus className="size-4 mr-2" />
                  Add Your First Recipe
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="relative"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleToggleRecipeSelection(recipe.id);
                    }}
                  >
                    {selectedRecipeIds.includes(recipe.id) && (
                      <div className="absolute -top-2 -right-2 z-10 size-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <div onClick={(e) => {
                      if (e.shiftKey || e.metaKey || e.ctrlKey) {
                        handleToggleRecipeSelection(recipe.id);
                      }
                    }}>
                      <RecipeCard
                        recipe={recipe}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={handleSelectRecipe}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}