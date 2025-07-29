import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Copy, Eye, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file validation
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    return null;
  };

  // Process files and create previews
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: ImageFile[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }

      if (uploadedImages.length + validFiles.length >= maxImages) {
        errors.push(`Maximum ${maxImages} images allowed`);
        break;
      }

      const imageFile: ImageFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      validFiles.push(imageFile);
    }

    if (errors.length > 0) {
      console.warn('Upload errors:', errors);
      // Could show toast notifications here
    }

    if (validFiles.length > 0) {
      const newImages = [...uploadedImages, ...validFiles];
      setUploadedImages(newImages);
      
      // Save images and update parent
      const imagePaths = await saveImages(validFiles);
      onImagesChange([...images, ...imagePaths]);
    }
  }, [uploadedImages, maxImages, images, onImagesChange]);

  // Save images to file system
  const saveImages = async (imageFiles: ImageFile[]): Promise<string[]> => {
    const savedPaths: string[] = [];
    
    for (const imageFile of imageFiles) {
      try {
        // Convert file to base64 for IPC
        const base64 = await fileToBase64(imageFile.file);
        const result = await window.api.saveScreenshot({
          filename: imageFile.name,
          data: base64,
          tradeId: 'current' // This would be passed as prop in real implementation
        });
        
        if (result.success && result.data) {
          savedPaths.push(result.data.path);
        }
      } catch (error) {
        console.error('Failed to save image:', error);
      }
    }
    
    return savedPaths;
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  };

  // Handle paste from clipboard
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter(item => 
      item.type.startsWith('image/')
    );

    if (imageItems.length > 0) {
      const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[];
      processFiles(files);
    }
  }, [processFiles]);

  // Set up paste listener
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Remove image
  const removeImage = async (index: number, isUploaded: boolean = false) => {
    if (isUploaded) {
      // Remove from uploaded images
      const imageToRemove = uploadedImages[index];
      URL.revokeObjectURL(imageToRemove.preview);
      
      const newUploadedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newUploadedImages);
    } else {
      // Remove from saved images
      const imageToRemove = images[index];
      try {
        await window.api.deleteScreenshot({ path: imageToRemove });
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalImages = images.length + uploadedImages.length;
  const canUploadMore = totalImages < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUploadMore && (
        <Card
          className={`relative border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="mb-2">
              <span className="font-medium text-gray-700">
                Click to upload or drag and drop
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              PNG, JPG, GIF up to {maxFileSize}MB each
            </div>
            <div className="text-xs text-gray-400">
              <Copy className="inline h-3 w-3 mr-1" />
              Or paste from clipboard (Ctrl/Cmd+V)
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {totalImages}/{maxImages} images
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </Card>
      )}

      {/* Image Gallery */}
      {(images.length > 0 || uploadedImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Saved Images */}
          {images.map((imagePath, index) => (
            <Card key={`saved-${index}`} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={`file://${imagePath}`}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowPreview(imagePath)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(imagePath);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index, false);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Newly Uploaded Images */}
          {uploadedImages.map((imageFile, index) => (
            <Card key={imageFile.id} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={imageFile.preview}
                  alt={imageFile.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowPreview(imageFile.preview)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(imageFile.preview);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index, true);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2">
                  <div className="truncate">{imageFile.name}</div>
                  <div>{formatFileSize(imageFile.size)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={showPreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowPreview(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};