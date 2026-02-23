import { Recipe } from '../types';
import { Heart, Clock, Users, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onClick: (id: string) => void;
}

export function RecipeCard({ recipe, onToggleFavorite, onClick }: RecipeCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(recipe.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 hover:bg-white ${
            recipe.isFavorite ? 'text-red-500' : 'text-gray-400'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
        >
          <Heart className={`size-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="size-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
