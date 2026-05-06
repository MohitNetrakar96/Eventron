import React, { useState } from 'react';
import Image from 'next/image';

const MultipleImageUploader = ({ onImagesUpload, label = 'Upload Images', existingImageUrls = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrls, setPreviewUrls] = useState(existingImageUrls);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    console.log(`Selected ${files.length} files`);

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setUploadError('Please select valid image files (JPG, PNG, or GIF)');
      return;
    }

    const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      setUploadError('Image sizes should be less than 5MB each');
      return;
    }

    // Create previews
    const newPreviews = [];
    for (const file of files) {
      const preview = await readFileAsDataURL(file);
      newPreviews.push(preview);
    }
    
    // Combine with existing previews
    setPreviewUrls([...previewUrls, ...newPreviews]);

    // Upload the files
    try {
      setIsUploading(true);
      setUploadError('');
      setUploadProgress(0);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      console.log('Uploading to:', `${process.env.NEXT_PUBLIC_API_URL}/upload/images`);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Upload response status:', response.status);
      
      // Try to get the text response first for debugging
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // If not OK, show the error
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${responseText}`);
      }
      
      // Parse the JSON response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      console.log('Upload successful:', data);
      
      // Call the callback with the image URLs
      if (data.files && data.files.length > 0) {
        const imageUrls = data.files.map(file => file.secure_url || file.url);
        onImagesUpload([...previewUrls, ...imageUrls]);
      } else {
        throw new Error('No image URLs in response');
      }
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewUrls];
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);
    onImagesUpload(updatedPreviews);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      
      {/* Image preview grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative h-32 border rounded overflow-hidden">
              <Image
                src={url}
                alt={`Preview ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-md p-4 text-center ${
          isUploading ? 'bg-gray-100' : 'hover:bg-gray-50'
        } transition-colors`}
      >
        {isUploading ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Uploading... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-2">
              <svg 
                className="w-10 h-10 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:underline">Select images</span> or drag and drop
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFilesChange} 
                accept=".jpg,.jpeg,.png,.gif"
                multiple
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
          </>
        )}
      </div>
      
      {uploadError && (
        <p className="text-red-500 text-sm mt-1">{uploadError}</p>
      )}
    </div>
  );
};

export default MultipleImageUploader;
