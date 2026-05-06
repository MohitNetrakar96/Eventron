import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageUploader = ({ onImageUpload, label = 'Upload Image', existingImageUrl = null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update preview URL if existingImageUrl changes (e.g., from parent component)
  useEffect(() => {
    setPreviewUrl(existingImageUrl);
  }, [existingImageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`Selected file for ${label}:`, file.name, file.type, file.size);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    try {
      setIsUploading(true);
      setUploadError('');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('image', file);

      console.log(`Uploading ${label} to:`, `${process.env.NEXT_PUBLIC_API_URL}/upload/image`);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log(`${label} upload response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload error response:`, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`${label} upload successful:`, data);
      
      // Call the callback with the image URL
      if (data.file && data.file.secure_url) {
        onImageUpload(data.file.secure_url);
      } else if (data.file && data.file.url) {
        onImageUpload(data.file.url);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('No image URL in response');
      }
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error(`Error uploading ${label}:`, error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-700 text-sm">
        {label}
      </label>
      
      <div className="flex items-center space-x-4">
        {/* Preview */}
        <div className="relative h-20 w-20 overflow-hidden rounded-md border border-gray-300 bg-gray-100">
          {previewUrl ? (
            <Image 
              src={previewUrl} 
              alt={`${label} preview`} 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        
        {/* Upload button */}
        <div className="flex-1">
          <label 
            htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-gray-300 hover:border-blue-500"
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </label>
          <input
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            name="file-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG or GIF up to 5MB
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {/* Error message */}
      {uploadError && (
        <p className="text-sm text-red-600 mt-1">{uploadError}</p>
      )}
    </div>
  );
};

export default ImageUploader;
