import { useState } from 'react';
import { Recipe } from '../types';
import { 
  Link2, 
  Facebook, 
  Twitter, 
  Mail, 
  FileText, 
  Download,
  Check,
  Copy,
  Globe,
  Lock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

interface ShareModalProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({ recipe, open, onOpenChange }: ShareModalProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/recipe/${recipe.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out this recipe: ${recipe.title}`;
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform}...`);
    }
  };

  const generateTextExport = () => {
    let text = `${recipe.title}\n${'='.repeat(recipe.title.length)}\n\n`;
    text += `${recipe.description}\n\n`;
    text += `Servings: ${recipe.servings}\n`;
    text += `Prep Time: ${recipe.prepTime}\n`;
    text += `Cook Time: ${recipe.cookTime}\n`;
    text += `Category: ${recipe.category}\n\n`;
    
    text += `INGREDIENTS:\n`;
    recipe.ingredients.forEach(ing => {
      text += `- ${ing.quantity} ${ing.unit} ${ing.name}\n`;
    });
    
    text += `\nINSTRUCTIONS:\n`;
    recipe.steps.forEach((step, i) => {
      text += `${i + 1}. ${step}\n`;
    });
    
    return text;
  };

  const handleTextExport = () => {
    const text = generateTextExport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Recipe exported as text file');
  };

  const handlePDFExport = () => {
    // In a real app, this would generate a proper PDF
    // For now, we'll just show a success message
    toast.success('PDF export feature coming soon!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Recipe</DialogTitle>
          <DialogDescription>
            Share "{recipe.title}" with others
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            {/* Privacy Settings */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="size-5 text-blue-500" />
                ) : (
                  <Lock className="size-5 text-gray-500" />
                )}
                <div>
                  <Label className="font-medium">
                    {isPublic ? 'Public Link' : 'Private Link'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {isPublic 
                      ? 'Anyone with the link can view this recipe' 
                      : 'Only people you share with can view'}
                  </p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <Check className="size-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Link Preview</p>
              <div className="flex gap-3">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="size-20 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{recipe.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <p className="text-sm text-gray-600">Share this recipe on social media</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => handleSocialShare('facebook')}
              >
                <Facebook className="size-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Facebook</div>
                  <div className="text-xs text-gray-500">Share on Facebook</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => handleSocialShare('twitter')}
              >
                <Twitter className="size-5 mr-3 text-sky-500" />
                <div className="text-left">
                  <div className="font-medium">Twitter</div>
                  <div className="text-xs text-gray-500">Share on Twitter</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4 col-span-2"
                onClick={() => handleSocialShare('email')}
              >
                <Mail className="size-5 mr-3 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-xs text-gray-500">Share via email</div>
                </div>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <p className="text-sm text-gray-600">Export recipe to different formats</p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={handleTextExport}
              >
                <FileText className="size-5 mr-3 text-blue-600" />
                <div className="text-left flex-1">
                  <div className="font-medium">Export as Text</div>
                  <div className="text-xs text-gray-500">
                    Download recipe as a .txt file
                  </div>
                </div>
                <Download className="size-4 text-gray-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={handlePDFExport}
              >
                <Download className="size-5 mr-3 text-red-600" />
                <div className="text-left flex-1">
                  <div className="font-medium">Export as PDF</div>
                  <div className="text-xs text-gray-500">
                    Download recipe as a PDF file
                  </div>
                </div>
                <Download className="size-4 text-gray-400" />
              </Button>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium mb-2">Export Preview</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {generateTextExport().substring(0, 300)}...
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
