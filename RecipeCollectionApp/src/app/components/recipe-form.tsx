import { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

interface RecipeFormProps {
  recipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const [formData, setFormData] = useState<Partial<Recipe>>(
    recipe || {
      title: '',
      description: '',
      servings: 4,
      prepTime: '',
      cookTime: '',
      category: '',
      image: '',
      ingredients: [],
      steps: [],
      tags: [],
      isFavorite: false,
    }
  );

  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: '',
    quantity: 0,
    unit: '',
    scalable: true,
  });

  const [newStep, setNewStep] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && newIngredient.unit) {
      setFormData({
        ...formData,
        ingredients: [...(formData.ingredients || []), newIngredient],
      });
      setNewIngredient({ name: '', quantity: 0, unit: '', scalable: true });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients?.filter((_, i) => i !== index),
    });
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      setFormData({
        ...formData,
        steps: [...(formData.steps || []), newStep.trim()],
      });
      setNewStep('');
    }
  };

  const handleRemoveStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps?.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.servings || (formData.ingredients?.length || 0) === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipeToSave: Recipe = {
      id: recipe?.id || Date.now().toString(),
      title: formData.title || '',
      description: formData.description || '',
      servings: formData.servings || 4,
      prepTime: formData.prepTime || '',
      cookTime: formData.cookTime || '',
      category: formData.category || '',
      image: formData.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800',
      ingredients: formData.ingredients || [],
      steps: formData.steps || [],
      tags: formData.tags || [],
      isFavorite: formData.isFavorite || false,
      dateAdded: recipe?.dateAdded || Date.now(),
    };

    onSave(recipeToSave);
    toast.success(recipe ? 'Recipe updated successfully' : 'Recipe added successfully');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="size-4 mr-2" />
          Cancel
        </Button>
        <h1 className="text-2xl">{recipe ? 'Edit Recipe' : 'Add New Recipe'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Spaghetti Carbonara"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your recipe"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servings">Servings *</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Main Course, Dessert"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prepTime">Prep Time</Label>
                <Input
                  id="prepTime"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  placeholder="e.g., 15 min"
                />
              </div>
              <div>
                <Label htmlFor="cookTime">Cook Time</Label>
                <Input
                  id="cookTime"
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                  placeholder="e.g., 30 min"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-2">
              <Input
                className="col-span-5"
                placeholder="Ingredient name"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              />
              <Input
                className="col-span-2"
                type="number"
                placeholder="Qty"
                value={newIngredient.quantity || ''}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) })}
                step="0.1"
              />
              <Input
                className="col-span-2"
                placeholder="Unit"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              />
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={newIngredient.scalable}
                  onCheckedChange={(checked) => setNewIngredient({ ...newIngredient, scalable: checked })}
                />
                <span className="text-xs">Scale</span>
              </div>
              <Button
                type="button"
                className="col-span-1"
                size="icon"
                onClick={handleAddIngredient}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <ul className="space-y-2">
              {formData.ingredients?.map((ingredient, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    {!ingredient.scalable && <span className="text-xs text-gray-500 ml-2">(non-scalable)</span>}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a step"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                rows={2}
              />
              <Button type="button" size="icon" onClick={handleAddStep}>
                <Plus className="size-4" />
              </Button>
            </div>

            <ol className="space-y-2">
              {formData.steps?.map((step, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="flex-1">{step}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStep(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag}>
                <Plus className="size-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NEW: Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium mb-1">Public Recipe</Label>
                <p className="text-sm text-gray-600">
                  {formData.isPublic
                    ? 'Everyone can see this recipe'
                    : 'Only you can see this recipe'}
                </p>
              </div>
              <Switch
                checked={formData.isPublic || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="size-4 mr-2" />
            {recipe ? 'Update Recipe' : 'Save Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
}