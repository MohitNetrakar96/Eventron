import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import AdminNavBar from '@/components/AdminNavBar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { getAdminToken } from '@/utils/getAdminToken';
import Image from 'next/image';

const CreateVenuePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    description: '',
    facilities: '',
    image: '',
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = getAdminToken();
    
    if (!adminToken) {
      router.push('/admin/auth');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
      setUploadError('Only image files (JPEG, PNG, GIF) are allowed!');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit!');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedImage(data.file);
        setFormData(prev => ({
          ...prev,
          image: data.file.secure_url
        }));
      } else {
        setUploadError(data.msg || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('An error occurred during image upload');
    } finally {
      setUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name || !formData.location || !formData.capacity) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const adminToken = getAdminToken();
      
      // Process facilities (convert comma-separated string to array)
      const facilities = formData.facilities
        ? formData.facilities.split(',').map(item => item.trim())
        : [];
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          facilities,
          admin_id: adminToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Venue created successfully!');
        // Reset form
        setFormData({
          name: '',
          location: '',
          capacity: '',
          description: '',
          facilities: '',
          image: '',
        });
        
        // Redirect to venue details page after a short delay
        setTimeout(() => {
          router.push(`/admin/venues/${data.venue_id}`);
        }, 1500);
      } else {
        setError(data.msg || 'Failed to create venue');
      }
    } catch (error) {
      console.error('Error creating venue:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Create Venue | Eventron</title>
        <meta name="description" content="Create a new venue" />
      </Head>

      <AdminNavBar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/admin/venues')}
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Venues
            </button>
            <h1 className="text-3xl font-bold">Create New Venue</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Main Auditorium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Building A, 2nd Floor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., 200"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Describe the venue..."
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facilities
              </label>
              <input
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Projector, Sound System, WiFi (comma-separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter facilities separated by commas
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Image
                </label>
                <div className="flex flex-col space-y-4">
                  {/* Image Upload Option */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Option 1: Upload an Image</h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm"
                        disabled={uploading}
                        ref={fileInputRef}
                      />
                      {uploading && (
                        <span className="text-blue-600 animate-pulse">Uploading...</span>
                      )}
                    </div>
                    {uploadError && (
                      <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                    )}
                    {uploadedImage && (
                      <div className="mt-3">
                        <div className="relative h-40 w-full rounded-md overflow-hidden">
                          <img 
                            src={uploadedImage.secure_url} 
                            alt="Uploaded venue image" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Image URL Option */}
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Option 2: Provide Image URL</h3>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="https://example.com/image.jpg"
                      disabled={uploadedImage !== null}
                    />
                    {uploadedImage && (
                      <p className="mt-1 text-sm text-amber-600">
                        Remove uploaded image to use URL instead
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to use default venue image
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/venues')}
                className="px-4 py-2 mr-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Venue'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateVenuePage;
