import { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { ArrowLeft, Link2, Loader2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface ImportRecipeProps {
  onBack: () => void;
  onImport: (recipe: Recipe) => void;
}

export function ImportRecipe({ onBack, onImport }: ImportRecipeProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);

  // Mock recipe parser - in a real app, this would call a backend API
  const parseRecipeFromUrl = async (url: string): Promise<Recipe> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock parsed recipe
    const mockRecipe: Recipe = {
      id: Date.now().toString(),
      title: 'Imported Recipe from ' + new URL(url).hostname,
      description: 'This is a mock imported recipe. In a real application, we would parse the recipe content from the URL.',
      servings: 4,
      prepTime: '15 min',
      cookTime: '30 min',
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      ingredients: [
        { name: 'Ingredient 1', quantity: 200, unit: 'g', scalable: true },
        { name: 'Ingredient 2', quantity: 2, unit: 'cups', scalable: true },
        { name: 'Ingredient 3', quantity: 1, unit: 'tsp', scalable: true },
      ],
      steps: [
        'Step 1: Prepare the ingredients',
        'Step 2: Combine everything',
        'Step 3: Cook and serve',
      ],
      tags: ['Imported'],
      isFavorite: false,
      dateAdded: Date.now(),
    };

    return mockRecipe;
  };

  const handleImport = async () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const recipe = await parseRecipeFromUrl(url);
      setPreviewRecipe(recipe);
      toast.success('Recipe imported successfully!');
    } catch (error) {
      toast.error('Failed to import recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewRecipe) {
      onImport(previewRecipe);
      toast.success('Recipe added to your collection');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
      </div>

      <h1 className="text-3xl mb-6">Import Recipe</h1>

      {!previewRecipe ? (
        <Card>
          <CardHeader>
            <CardTitle>Import from URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">Recipe URL</Label>
              <p className="text-sm text-gray-600 mb-2">
                Enter the URL of a recipe from a supported website
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/recipe"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import'
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Paste a recipe URL from a supported website</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>We'll automatically extract the recipe details</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Review and confirm before adding to your collection</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This is a demo feature. In a production app, 
                we would integrate with recipe parsing services or APIs to extract 
                recipe data from various cooking websites.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 size-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Check className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Recipe Imported Successfully</h3>
                  <p className="text-sm text-green-700">
                    Review the details below and confirm to add to your collection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-60 rounded-lg overflow-hidden">
                <img
                  src={previewRecipe.image}
                  alt={previewRecipe.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-2xl mb-2">{previewRecipe.title}</h2>
                <p className="text-gray-600">{previewRecipe.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Servings:</dt>
                      <dd className="font-medium">{previewRecipe.servings}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Prep Time:</dt>
                      <dd className="font-medium">{previewRecipe.prepTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Cook Time:</dt>
                      <dd className="font-medium">{previewRecipe.cookTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{previewRecipe.category}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Ingredients ({previewRecipe.ingredients.length})</h3>
                  <ul className="space-y-1 text-sm">
                    {previewRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-gray-600">
                        {ing.quantity} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Instructions ({previewRecipe.steps.length} steps)</h3>
                <ol className="space-y-2 text-sm">
                  {previewRecipe.steps.map((step, i) => (
                    <li key={i} className="text-gray-600">
                      {i + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setPreviewRecipe(null);
                setUrl('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmImport}>
              <Check className="size-4 mr-2" />
              Add to Collection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
