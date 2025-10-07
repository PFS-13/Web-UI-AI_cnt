import { useState, useRef } from 'react';

interface UseFileUploadReturn {
  uploadedImages: File[];
  imagePreviews: string[];
  selectedImageIndex: number | null;
  isModalOpen: boolean;
  isDragOver: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  setUploadedImages: React.Dispatch<React.SetStateAction<File[]>>;
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDragOver: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  openImageModal: (index: number) => void;
  closeImageModal: () => void;
  nextImage: () => void;
  prevImage: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  clearImages: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const previewPromises: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      // Validasi file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      validFiles.push(file);
      
      // Buat preview URL
      const previewPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
      previewPromises.push(previewPromise);
    });

    if (validFiles.length > 0) {
      setUploadedImages(prev => [...validFiles, ...prev]);
      
      // Update previews setelah semua file dibaca
      Promise.all(previewPromises).then((previews) => {
        setImagePreviews(prev => [...previews, ...prev]);
      });
    }

    // Reset input value agar bisa upload file yang sama lagi
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
    setIsModalOpen(false);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < imagePreviews.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload({ target: { files } } as any);
    }
  };


  const clearImages = () => {
    setUploadedImages([]);
    setImagePreviews([]);
    setSelectedImageIndex(null);
    setIsModalOpen(false);
  };

  return {
    uploadedImages,
    imagePreviews,
    selectedImageIndex,
    isModalOpen,
    isDragOver,
    isDragging,
    fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>,
    dropZoneRef: dropZoneRef as React.RefObject<HTMLDivElement>,
    setUploadedImages,
    setImagePreviews,
    setSelectedImageIndex,
    setIsModalOpen,
    setIsDragOver,
    setIsDragging,
    handleImageUpload,
    removeImage,
    openImageModal,
    closeImageModal,
    nextImage,
    prevImage,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearImages,
  };
};
