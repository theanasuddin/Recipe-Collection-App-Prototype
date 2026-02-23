import { useState } from 'react';
import { Collection } from '../types';
import { Plus, Edit2, Trash2, FolderPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

interface CollectionsManagerProps {
  collections: Collection[];
  onCreateCollection: (name: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
  onDeleteCollection: (id: string) => void;
  onSelectCollection: (collection: Collection | null) => void;
  selectedCollectionId?: string;
}

export function CollectionsManager({
  collections,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onSelectCollection,
  selectedCollectionId,
}: CollectionsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    if (collections.some(c => c.name.toLowerCase() === newCollectionName.toLowerCase())) {
      toast.error('A collection with this name already exists');
      return;
    }

    onCreateCollection(newCollectionName.trim());
    setNewCollectionName('');
    setIsCreateDialogOpen(false);
    toast.success('Collection created');
  };

  const handleRenameCollection = () => {
    if (!newCollectionName.trim() || !editingCollection) {
      toast.error('Please enter a collection name');
      return;
    }

    if (collections.some(c => c.id !== editingCollection.id && c.name.toLowerCase() === newCollectionName.toLowerCase())) {
      toast.error('A collection with this name already exists');
      return;
    }

    onRenameCollection(editingCollection.id, newCollectionName.trim());
    setNewCollectionName('');
    setEditingCollection(null);
    setIsRenameDialogOpen(false);
    toast.success('Collection renamed');
  };

  const handleDeleteCollection = () => {
    if (deletingCollection) {
      onDeleteCollection(deletingCollection.id);
      setDeletingCollection(null);
      setIsDeleteDialogOpen(false);
      toast.success('Collection deleted');
    }
  };

  const openRenameDialog = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setIsRenameDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection) => {
    setDeletingCollection(collection);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Collections</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="size-4 mr-2" />
          New Collection
        </Button>
      </div>

      <div className="space-y-2">
        {collections.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FolderPlus className="size-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-4">
                No collections yet. Create one to organize your recipes!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="size-4 mr-2" />
                Create Collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          collections.map((collection) => (
            <Card
              key={collection.id}
              className={`cursor-pointer transition-colors ${
                selectedCollectionId === collection.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectCollection(collection)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{collection.name}</h4>
                    <p className="text-sm text-gray-600">
                      {collection.recipeIds.length} recipe{collection.recipeIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(collection);
                      }}
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(collection);
                      }}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Give your collection a name to organize your recipes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="e.g., Weekly Meals, Party Recipes"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCollection()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewCollectionName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Collection Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Collection</DialogTitle>
            <DialogDescription>
              Enter a new name for this collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rename-collection">Collection Name</Label>
              <Input
                id="rename-collection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameCollection()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setNewCollectionName('');
                setEditingCollection(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameCollection}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCollection?.name}"? 
              The recipes will not be deleted, only removed from this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCollection(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCollection} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
