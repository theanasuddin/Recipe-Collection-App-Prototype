import { useState, useMemo } from 'react';
import { Recipe, ShoppingListItem } from '../types';
import { ArrowLeft, ShoppingCart, Printer, Download, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface ShoppingListProps {
  recipes: Recipe[];
  onBack: () => void;
}

export function ShoppingList({ recipes, onBack }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Combine and merge ingredients from all recipes
  const shoppingList = useMemo(() => {
    const itemsMap = new Map<string, ShoppingListItem>();

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        // Create a key based on ingredient name and unit
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;
        
        if (itemsMap.has(key)) {
          const existing = itemsMap.get(key)!;
          // Only sum if scalable, otherwise keep separate
          if (ingredient.scalable && existing.scalable) {
            existing.quantity += ingredient.quantity;
            existing.recipeIds.push(recipe.id);
          } else {
            // Non-scalable items get listed separately
            const nonScalableKey = `${key}-${recipe.id}`;
            itemsMap.set(nonScalableKey, {
              ...ingredient,
              recipeIds: [recipe.id],
            });
          }
        } else {
          itemsMap.set(key, {
            ...ingredient,
            recipeIds: [recipe.id],
          });
        }
      });
    });

    return Array.from(itemsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [recipes]);

  // Group items by category (we'll use simple heuristics)
  const categorizedList = useMemo(() => {
    const categories = {
      'Produce': [] as ShoppingListItem[],
      'Dairy & Eggs': [] as ShoppingListItem[],
      'Meat & Seafood': [] as ShoppingListItem[],
      'Pantry': [] as ShoppingListItem[],
      'Spices & Seasonings': [] as ShoppingListItem[],
      'Other': [] as ShoppingListItem[],
    };

    const produceKeywords = ['tomato', 'lettuce', 'onion', 'garlic', 'pepper', 'cucumber', 'banana', 'apple', 'carrot', 'broccoli'];
    const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg'];
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'pancetta'];
    const spiceKeywords = ['salt', 'pepper', 'oregano', 'basil', 'cumin', 'paprika', 'vanilla', 'cinnamon', 'ginger'];

    shoppingList.forEach((item) => {
      const nameLower = item.name.toLowerCase();
      
      if (produceKeywords.some(kw => nameLower.includes(kw))) {
        categories['Produce'].push(item);
      } else if (dairyKeywords.some(kw => nameLower.includes(kw))) {
        categories['Dairy & Eggs'].push(item);
      } else if (meatKeywords.some(kw => nameLower.includes(kw))) {
        categories['Meat & Seafood'].push(item);
      } else if (spiceKeywords.some(kw => nameLower.includes(kw))) {
        categories['Spices & Seasonings'].push(item);
      } else if (item.unit === 'g' || item.unit === 'cup' || item.unit === 'tbsp') {
        categories['Pantry'].push(item);
      } else {
        categories['Other'].push(item);
      }
    });

    return categories;
  }, [shoppingList]);

  const handleToggleItem = (itemKey: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey);
    } else {
      newChecked.add(itemKey);
    }
    setCheckedItems(newChecked);
  };

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleExport = () => {
    let text = 'SHOPPING LIST\n';
    text += '='.repeat(40) + '\n\n';
    text += `Generated from ${recipes.length} recipe(s)\n\n`;

    Object.entries(categorizedList).forEach(([category, items]) => {
      if (items.length > 0) {
        text += `${category.toUpperCase()}\n`;
        text += '-'.repeat(category.length) + '\n';
        items.forEach((item) => {
          const qty = item.scalable 
            ? `${Math.round(item.quantity * 100) / 100}` 
            : item.quantity;
          text += `☐ ${qty} ${item.unit} ${item.name}\n`;
        });
        text += '\n';
      }
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Shopping list exported');
  };

  const checkedCount = checkedItems.size;
  const totalCount = shoppingList.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="size-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-6" />
                Shopping List
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                From {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {checkedCount}/{totalCount}
              </div>
              <div className="text-sm text-gray-600">items checked</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {recipes.map((recipe) => (
              <Badge key={recipe.id} variant="outline">
                {recipe.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(categorizedList).map(([category, items]) => {
          if (items.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {items.map((item, index) => {
                    const itemKey = `${category}-${item.name}-${index}`;
                    const isChecked = checkedItems.has(itemKey);
                    const qty = item.scalable 
                      ? Math.round(item.quantity * 100) / 100
                      : item.quantity;

                    return (
                      <li 
                        key={itemKey}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleToggleItem(itemKey)}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleItem(itemKey)}
                        />
                        <div className={`flex-1 ${isChecked ? 'line-through text-gray-400' : ''}`}>
                          <div className="font-medium">
                            {qty} {item.unit} {item.name}
                          </div>
                          {!item.scalable && (
                            <div className="text-xs text-amber-600 mt-1">
                              Non-scalable - adjust to taste
                            </div>
                          )}
                          {item.recipeIds.length > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Used in {item.recipeIds.length} recipes
                            </div>
                          )}
                        </div>
                        {isChecked && (
                          <Check className="size-5 text-green-600 flex-shrink-0" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
