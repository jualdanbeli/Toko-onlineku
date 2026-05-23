import { useCreateProduct, useGetCategories } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus } from "lucide-react";

export default function ProductForm() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const { data: categories } = useGetCategories();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    condition: "new" as "new" | "used",
    categoryId: "",
    images: [] as string[],
    imageUrl: "", // For adding via URL
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId || formData.images.length === 0) {
      toast({ title: "Incomplete form", description: "Please fill all required fields and add at least one image.", variant: "destructive" });
      return;
    }

    createProduct.mutate({
      data: {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        condition: formData.condition,
        categoryId: parseInt(formData.categoryId),
        images: formData.images
      }
    }, {
      onSuccess: () => {
        toast({ title: "Product created successfully!" });
        setLocation("/seller/products");
      },
      onError: (err: any) => {
        toast({ title: "Error creating product", description: err.message, variant: "destructive" });
      }
    });
  };

  const addImage = () => {
    if (formData.imageUrl && formData.images.length < 5) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, prev.imageUrl],
        imageUrl: ""
      }));
    }
  };

  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Add New Product</h1>
        <p className="text-muted-foreground">Fill in the details to list a new item in your shop.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input 
                    placeholder="e.g. Sepatu Sneakers Pria Original" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Describe your product in detail..." 
                    className="min-h-[150px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (IDR) *</Label>
                  <Input 
                    type="number" 
                    placeholder="50000" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock *</Label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Condition *</Label>
                  <Select value={formData.condition} onValueChange={(v: "new" | "used") => setFormData({...formData, condition: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used / Second-hand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Image via URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://..." 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    />
                    <Button type="button" variant="secondary" onClick={addImage} disabled={!formData.imageUrl || formData.images.length >= 5}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Max 5 images</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden relative group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground">
                      <ImagePlus className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Add Image</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full font-bold text-lg py-6" disabled={createProduct.isPending}>
              {createProduct.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Publish Product
            </Button>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}
