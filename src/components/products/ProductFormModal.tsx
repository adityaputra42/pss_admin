import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoriesApi } from '../../services/api-services';
import type { Category } from '../../services/api-services/categories';
import { Plus, Trash, X, Image as ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onSave: (formData: FormData, productId: number | null) => void;
}

const sizeSchema = z.object({
  id: z.number().optional(),
  size: z.string().min(1, 'Size required'),
  stock: z.number().min(0, 'Stock trivial'),
});

const colorVariantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Color name required'),
  color: z.string().min(1, 'Color code required'),
  image: z.any().optional(),
  sizes: z.array(sizeSchema).min(1, 'At least one size required'),
});

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 chars'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Price must be positive'),
  category_id: z.number().positive('Category is required'),
  image: z.any().optional().nullable(),
  color_varians: z.array(colorVariantSchema).optional(),
});

interface ProductFormInputs {
  name: string;
  description?: string | null;
  price: number;
  category_id: number;
  image?: any;
  color_varians?: {
    id?: number;
    name: string;
    color: string;
    image?: any;
    sizes: {
      id?: number;
      size: string;
      stock: number;
    }[];
    preview?: string | null;
  }[];
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      categoriesApi.getCategories(100)
        .then(setCategories)
        .catch(console.error);
    }
  }, [isOpen]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      color_varians: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'color_varians',
  });

  const mainImageFile = watch('image');
  useEffect(() => {
    if (mainImageFile && mainImageFile[0] instanceof File) {
      const url = URL.createObjectURL(mainImageFile[0]);
      setMainImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (product && product.images && !mainImageFile) {
        setMainImagePreview(product.images);
    } else {
        setMainImagePreview(null);
    }
  }, [mainImageFile, product]);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const formVariants = product.color_varian?.map((cv: any) => ({
        id: cv.id,
        name: cv.name,
        color: cv.color,
        image: null,
        preview: Array.isArray(cv.images) ? (cv.images.length > 0 ? cv.images[0] : null) : cv.images,
        sizes: cv.size_varian?.map((sv: any) => ({
             id: sv.id,
             size: sv.size,
             stock: sv.stock
        })) || []
      })) || [];

      reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category?.id || product.category_id,
        color_varians: formVariants,
        image: null,
      });
      setMainImagePreview(product.images);
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        category_id: 0,
        color_varians: [],
        image: null,
      });
      setMainImagePreview(null);
    }
  }, [isOpen, product, reset]);

  const onSubmit: SubmitHandler<ProductFormInputs> = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('category_id', String(data.category_id));

    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    if (data.color_varians && data.color_varians.length > 0) {
        const variantsMetadata = data.color_varians.map((cv) => {
            return {
                id: cv.id || null, 
                name: cv.name,
                color: cv.color,
                sizes: cv.sizes.map(s => ({
                    id: s.id || null,
                    size: s.size,
                    stock: s.stock
                }))
            };
        });
        
        formData.append('color_varian', JSON.stringify(variantsMetadata));

    data.color_varians.forEach((cv, index) => {
             // Check if it is a FileList (new upload) and has a file
             if (cv.image && cv.image instanceof FileList && cv.image[0]) {
                 if (product && cv.id) {
                     // For Update: use color_image_ID
                     formData.append(`color_image_${cv.id}`, cv.image[0]);
                 } else {
                     // For Create OR new variant in update:
                     if (product) {
                        formData.append(`color_image_new_${index}`, cv.image[0]);
                     } else {
                        formData.append(`color_image_${index}`, cv.image[0]);
                     }
                 }
             }
        });
    }

    onSave(formData, product ? product.id : null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-95"
                >
                    <DialogPanel className="w-full max-w-4xl rounded-2xl md:rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    {product ? 'Edit Product' : 'Create New Product'}
                                </DialogTitle>
                                <p className="text-xs text-slate-500 font-medium">Fill in the details below to save your product.</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary">
                                    <ImageIcon className="w-4 h-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">General Information</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                                        <input {...register('name')} placeholder="e.g. Premium Cotton T-Shirt" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium" />
                                        {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
                                    </div>
                                    
                                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <select {...register('category_id', { valueAsNumber: true })} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium appearance-none">
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.category_id.message}</p>}
                                    </div>

                                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Price (IDR)</label>
                                        <input type="number" {...register('price', { valueAsNumber: true })} placeholder="0" className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold" />
                                        {errors.price && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.price.message}</p>}
                                    </div>

                                    <div className="lg:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Featured Image</label>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                                {mainImagePreview ? (
                                                     <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" accept="image/*" {...register('image')} className="text-xs font-medium text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-primary hover:file:bg-teal-100 transition-all cursor-pointer w-full" />
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea {...register('description')} placeholder="Describe your product in detail..." className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium" rows={3} />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-8 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                     <div className="flex items-center gap-2 text-amber-600">
                                        <Plus className="w-4 h-4" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Product Variants (Colors & Sizes)</h3>
                                     </div>
                                     <button type="button" onClick={() => append({ name: '', color: '', sizes: [{ size: '', stock: 0 }] })} className="premium-button bg-slate-900 text-white text-xs hover:bg-black flex items-center gap-2 self-start sm:self-auto">
                                        <Plus className="w-3.5 h-3.5" /> New Variant
                                     </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 md:p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group animate-in fade-in slide-in-from-top-2">
                                            <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 p-1.5 bg-white text-slate-400 hover:text-rose-500 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                                                <X className="w-4 h-4"/>
                                            </button>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color Name</label>
                                                    <input {...register(`color_varians.${index}.name` as const)} placeholder="e.g. Jet Black" className="w-full bg-white border border-slate-100 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hex Code</label>
                                                     <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: watch(`color_varians.${index}.color`) || '#fff' }}></div>
                                                        <input {...register(`color_varians.${index}.color` as const)} placeholder="#000000" className="w-full bg-white border border-slate-100 rounded-lg py-2 pl-8 pr-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none font-mono" />
                                                     </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Variant Image</label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                                                             <VariantImagePreview file={watch(`color_varians.${index}.image`)} existingUrl={field.preview} />
                                                        </div>
                                                        <input type="file" accept="image/*" {...register(`color_varians.${index}.image` as const)} className="text-[10px] font-medium text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 w-full" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white/60 p-4 rounded-xl border border-slate-50 shadow-sm transition-all focus-within:bg-white focus-within:shadow-teal-100/20">
                                               <SizesFieldArray nestIndex={index} control={control} register={register} errors={errors} />
                                            </div>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 italic">No variants added. Click "New Variant" to start adding colors and sizes.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>

                        <div className="p-4 md:p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit(onSubmit)} 
                                className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100"
                            >
                                {product ? 'Update Product Details' : 'Publish Product to Store'}
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const SizesFieldArray = ({ nestIndex, control, register, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `color_varians.${nestIndex}.sizes`,
  });

  return (
    <div className="space-y-3">
        <label className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter ml-1">Sizes & Availability</label>
        <div className="flex flex-wrap gap-3">
            {fields.map((item, k) => (
                 <div key={item.id} className="flex gap-2 items-center bg-white p-2 border border-slate-100 rounded-lg shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="space-y-0.5">
                       <input {...register(`color_varians.${nestIndex}.sizes.${k}.size` as const)} placeholder="Size" className="w-16 border-none p-0 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0" />
                    </div>
                    <div className="w-px h-4 bg-slate-100"></div>
                     <div className="space-y-0.5">
                       <input type="number" {...register(`color_varians.${nestIndex}.sizes.${k}.stock` as const, { valueAsNumber: true })} placeholder="Qty" className="w-14 border-none p-0 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0" />
                    </div>
                     <button type="button" onClick={() => remove(k)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash className="w-3.5 h-3.5" />
                    </button>
                 </div>
            ))}
             <button 
                type="button" 
                onClick={() => append({ size: '', stock: 0 })} 
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 border border-teal-100 text-primary rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-teal-100 active:scale-95"
             >
                 <Plus className="w-3 h-3" /> Add Size
             </button>
        </div>
        {errors.color_varians?.[nestIndex]?.sizes?.message && <p className="text-rose-500 text-[10px] font-bold mt-1 px-1">{errors.color_varians[nestIndex].sizes.message}</p>}
    </div>
  );
}

const VariantImagePreview = ({ file, existingUrl }: { file: any, existingUrl?: string | null }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (file && file instanceof FileList && file.length > 0) {
            const url = URL.createObjectURL(file[0]);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (existingUrl) {
            setPreview(existingUrl);
        } else {
            setPreview(null);
        }
    }, [file, existingUrl]);

    if(preview) {
        return <img src={preview} alt="Variant" className="w-full h-full object-cover" />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center text-slate-300">
             <ImageIcon className="w-4 h-4" />
        </div>
    )
}

export default ProductFormModal;
