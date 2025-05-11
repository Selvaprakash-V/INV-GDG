'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Package, ArrowLeft, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = [
  'Dairy',
  'Bakery',
  'Meat',
  'Produce',
  'Beverages',
  'Canned Goods',
  'Frozen Foods',
  'Snacks',
  'Household',
  'Other'
];

export default function ClientEditProductPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    expiryDate: null,
    barcode: '',
    image: '/images/default-product.png'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (status === 'authenticated' && params?.id) {
        try {
          const response = await fetch(`/api/products/${params.id}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch product');
          }

          // Format the data for the form
          setFormData({
            name: data.product.name,
            description: data.product.description || '',
            category: data.product.category,
            price: data.product.price.toString(),
            stock: data.product.stock.toString(),
            expiryDate: new Date(data.product.expiryDate),
            barcode: data.product.barcode,
            image: data.product.image
          });
        } catch (error) {
          console.error('Error fetching product:', error);
          setErrors(prev => ({
            ...prev,
            fetch: error.message
          }));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
  }, [status, params?.id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user selects
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      expiryDate: date
    }));

    // Clear error when user selects date
    if (errors.expiryDate) {
      setErrors(prev => ({
        ...prev,
        expiryDate: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barcode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Call the API to update the product
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          expiryDate: formData.expiryDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      setSubmitStatus('success');

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/dashboard?tab=inventory');
      }, 2000);

    } catch (error) {
      console.error('Error updating product:', error);
      setSubmitStatus('error');
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Call the API to delete the product
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      // Close the dialog and redirect
      setDeleteDialogOpen(false);
      router.push('/admin/dashboard?tab=inventory');

    } catch (error) {
      console.error('Error deleting product:', error);
      setErrors(prev => ({
        ...prev,
        delete: error.message
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-purple-600" />
                      <div>
                        <CardTitle className="text-2xl">Edit Product</CardTitle>
                        <CardDescription>Update product information</CardDescription>
                      </div>
                    </div>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently remove the product from your inventory.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent>
                  {errors.fetch && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-600">Error</AlertTitle>
                      <AlertDescription>
                        {errors.fetch}
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'success' && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-600">Success!</AlertTitle>
                      <AlertDescription>
                        Product has been updated successfully. Redirecting...
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === 'error' && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-600">Error</AlertTitle>
                      <AlertDescription>
                        {errors.submit || 'Failed to update product. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {errors.delete && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-600">Error</AlertTitle>
                      <AlertDescription>
                        {errors.delete}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className={cn(errors.name && 'text-red-500')}>
                          Product Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={cn(errors.name && 'border-red-500')}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <Label className={cn(errors.category && 'text-red-500')}>
                          Category *
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange('category', value)}
                        >
                          <SelectTrigger className={cn(errors.category && 'border-red-500')}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <Label htmlFor="price" className={cn(errors.price && 'text-red-500')}>
                          Price *
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            className={cn('pl-7', errors.price && 'border-red-500')}
                          />
                        </div>
                        {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                      </div>

                      {/* Stock */}
                      <div className="space-y-2">
                        <Label htmlFor="stock" className={cn(errors.stock && 'text-red-500')}>
                          Stock Quantity *
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={handleChange}
                          className={cn(errors.stock && 'border-red-500')}
                        />
                        {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
                      </div>

                      {/* Expiry Date */}
                      <div className="space-y-2">
                        <Label className={cn(errors.expiryDate && 'text-red-500')}>
                          Expiry Date *
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !formData.expiryDate && 'text-muted-foreground',
                                errors.expiryDate && 'border-red-500'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.expiryDate ? format(formData.expiryDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.expiryDate}
                              onSelect={handleDateSelect}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
                      </div>

                      {/* Barcode */}
                      <div className="space-y-2">
                        <Label htmlFor="barcode" className={cn(errors.barcode && 'text-red-500')}>
                          Barcode *
                        </Label>
                        <Input
                          id="barcode"
                          value={formData.barcode}
                          onChange={handleChange}
                          className={cn(errors.barcode && 'border-red-500')}
                          disabled // Barcode should not be editable as it's a unique identifier
                        />
                        {errors.barcode && <p className="text-sm text-red-500">{errors.barcode}</p>}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating Product...' : 'Update Product'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
  );
}
