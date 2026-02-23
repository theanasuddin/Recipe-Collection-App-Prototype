import { useState } from 'react';
import { Recipe } from '../types';
import { storage } from '../utils/storage';
import { 
  Heart, 
  Clock, 
  Users, 
  Edit, 
  Share2, 
  ArrowLeft, 
  Plus, 
  Minus,
  AlertCircle,
  Eye,
  EyeOff,
  ThumbsUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onToggleFavorite: (id: string) => void;
  onShare: () => void;
}

export function RecipeDetail({ 
  recipe, 
  onBack, 
  onEdit, 
  onToggleFavorite,
  onShare 
}: RecipeDetailProps) {
  const [scaledServings, setScaledServings] = useState(recipe.servings);
  const [inputValue, setInputValue] = useState(recipe.servings.toString());
  const [inputError, setInputError] = useState('');

  const scalingFactor = scaledServings / recipe.servings;

  const handleServingsChange = (newServings: number) => {
    if (newServings <= 0) {
      setInputError('Servings must be greater than 0');
      return;
    }
    if (newServings > 100) {
      setInputError('Servings cannot exceed 100');
      return;
    }
    setInputError('');
    setScaledServings(newServings);
    setInputValue(newServings.toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setInputError('Please enter a valid number');
    } else if (num > 100) {
      setInputError('Servings cannot exceed 100');
    } else {
      setInputError('');
      setScaledServings(num);
    }
  };

  const formatQuantity = (quantity: number, scalable: boolean) => {
    if (!scalable) return quantity;
    const scaled = quantity * scalingFactor;
    // Round to 2 decimal places and remove trailing zeros
    return Math.round(scaled * 100) / 100;
  };

  const isScaled = scaledServings !== recipe.servings;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Recipes
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onShare}>
            <Share2 className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggleFavorite(recipe.id)}
          >
            <Heart 
              className={`size-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
          <Button onClick={onEdit}>
            <Edit className="size-4 mr-2" />
            Edit Recipe
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-80 rounded-lg overflow-hidden mb-6">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title and Info */}
      <div className="mb-6">
        <h1 className="text-3xl mb-3">{recipe.title}</h1>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="size-5" />
            <div>
              <div className="text-sm">Prep: {recipe.prepTime}</div>
              <div className="text-sm">Cook: {recipe.cookTime}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <div className="text-sm">Category: {recipe.category}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
            
            {/* Serving Size Selector */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm mb-2 block">Servings</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleServingsChange(scaledServings - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-center"
                    min="1"
                    max="100"
                    step="0.5"
                  />
                  {inputError && (
                    <p className="text-xs text-red-500 mt-1">{inputError}</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleServingsChange(scaledServings + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              
              {isScaled && (
                <div className="mt-2 text-xs text-gray-600 text-center">
                  Original: {recipe.servings} servings
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => {
                const scaledQty = formatQuantity(ingredient.quantity, ingredient.scalable);
                const showScaling = isScaled && ingredient.scalable;
                
                return (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {showScaling ? (
                          <>
                            <span className="line-through text-gray-400 text-sm">
                              {ingredient.quantity}
                            </span>
                            <span className="font-medium text-blue-600">
                              {scaledQty}
                            </span>
                          </>
                        ) : (
                          <span className={showScaling ? 'font-medium text-blue-600' : ''}>
                            {scaledQty}
                          </span>
                        )}
                        <span>{ingredient.unit}</span>
                        <span>{ingredient.name}</span>
                        
                        {!ingredient.scalable && isScaled && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="size-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">
                                  This ingredient doesn't scale automatically. 
                                  Adjust to taste or use your judgment.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-700">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}