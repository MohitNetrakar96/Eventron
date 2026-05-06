import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminNavBar from '@/components/AdminNavBar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { getAdminToken } from '@/utils/getAdminToken';
import Image from 'next/image';

const VenueDetailsPage = () => {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    description: '',
    facilities: '',
    image: '',
    availability: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const router = useRouter();
  const { venue_id } = router.query;

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = getAdminToken();
    
    if (!adminToken) {
      router.push('/admin/auth');
      return;
    }

    if (!venue_id) return;

    // Fetch venue details
    const fetchVenueDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${venue_id}`);
        if (response.ok) {
          const data = await response.json();
          setVenue(data);
          setFormData({
            name: data.name || '',
            location: data.location || '',
            capacity: data.capacity || '',
            description: data.description || '',
            facilities: data.facilities ? data.facilities.join(', ') : '',
            image: data.image || '',
            availability: data.availability !== undefined ? data.availability : true,
          });
        } else {
          console.error('Failed to fetch venue details');
          setError('Failed to load venue details');
        }
      } catch (error) {
        console.error('Error fetching venue details:', error);
        setError('An error occurred while loading venue details');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [router, venue_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name || !formData.location || !formData.capacity) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const adminToken = getAdminToken();
      
      // Process facilities (convert comma-separated string to array)
      const facilities = formData.facilities
        ? formData.facilities.split(',').map(item => item.trim())
        : [];
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${venue_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity),
          description: formData.description,
          facilities,
          image: formData.image,
          availability: formData.availability,
          admin_id: adminToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Venue updated successfully!');
        // Update venue data
        setVenue(prev => ({
          ...prev,
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity),
          description: formData.description,
          facilities,
          image: formData.image,
          availability: formData.availability,
        }));
        setEditMode(false);
      } else {
        setError(data.msg || 'Failed to update venue');
      }
    } catch (error) {
      console.error('Error updating venue:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const adminToken = getAdminToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${venue_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_id: adminToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Venue deleted successfully!');
        // Redirect to venues page after a short delay
        setTimeout(() => {
          router.push('/admin/venues');
        }, 1500);
      } else {
        setError(data.msg || 'Failed to delete venue');
        setDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      setError('An error occurred. Please try again.');
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminNavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!venue && !loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminNavBar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Venue Not Found</h1>
            <p className="mb-4">The venue you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/admin/venues')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Back to Venues
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{venue?.name || 'Venue Details'} | Eventron</title>
        <meta name="description" content="Venue details and management" />
      </Head>

      <AdminNavBar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/admin/venues')}
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Venues
            </button>
            <h1 className="text-3xl font-bold">{editMode ? 'Edit Venue' : venue?.name}</h1>
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

          {/* Venue Details */}
          <div className="mb-6">
            <h2 className="text-xl font-bold">Venue Details</h2>
          </div>

          {/* Venue Content */}
          {!editMode ? (
            <div>
              <div className="mb-6 relative h-64 w-full rounded-lg overflow-hidden">
                <Image
                  src={venue.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1469&auto=format&fit=crop'}
                  alt={venue.name}
                  layout="fill"
                  objectFit="cover"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold text-white rounded ${venue.availability ? 'bg-green-500' : 'bg-red-500'}`}>
                  {venue.availability ? 'Available' : 'Unavailable'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Venue Information</h2>
                  <div className="space-y-3">
                    <p><span className="font-semibold">Name:</span> {venue.name}</p>
                    <p><span className="font-semibold">Location:</span> {venue.location}</p>
                    <p><span className="font-semibold">Capacity:</span> {venue.capacity} people</p>
                    <p><span className="font-semibold">Status:</span> {venue.availability ? 'Available' : 'Unavailable'}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-gray-700">{venue.description || 'No description provided.'}</p>
                  
                  {venue.facilities && venue.facilities.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Facilities:</h3>
                      <div className="flex flex-wrap gap-2">
                        {venue.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-200 rounded text-sm">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <div>
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete Venue
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2 text-red-600">Confirm delete?</span>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition mr-2"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Edit Venue
                  </button>
                </div>
              </div>
            </div>
          ) : (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="availability"
                  id="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="availability" className="ml-2 block text-sm text-gray-700">
                  Venue is available for booking
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 mr-2 border rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VenueDetailsPage;
