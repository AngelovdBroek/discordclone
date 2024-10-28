import React from 'react';
import { X } from 'lucide-react';

interface ImageUploadPreviewProps {
  imagePreview: string;
  onCancel: () => void;
}

export default function ImageUploadPreview({ imagePreview, onCancel }: ImageUploadPreviewProps) {
  return (
    <div className="relative mb-2 bg-[#2b2d31] rounded-lg p-3">
      <div className="relative">
        <img 
          src={imagePreview} 
          alt="Upload preview" 
          className="max-h-[300px] rounded-lg object-contain w-full"
        />
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 bg-[#2b2d31] rounded-full p-1 hover:bg-[#1e1f22] transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}