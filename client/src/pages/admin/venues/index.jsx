import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminNavBar from '@/components/AdminNavBar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { getAdminToken } from '@/utils/getAdminToken';
import Image from 'next/image';

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = getAdminToken();
    
    if (!adminToken) {
      router.push('/admin/auth');
      return;
    }

    // Fetch venues
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues`);
        if (response.ok) {
          const data = await response.json();
          setVenues(data);
        } else {
          console.error('Failed to fetch venues');
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [router]);

  const filteredVenues = () => {
    if (filter === 'all') return venues;
    if (filter === 'available') return venues.filter(venue => venue.availability);
    if (filter === 'unavailable') return venues.filter(venue => !venue.availability);
    return venues;
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Venue Management | Eventron</title>
        <meta name="description" content="Manage venues for events" />
      </Head>

      <AdminNavBar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Venue Management</h1>
          <button 
            onClick={() => router.push('/admin/venues/create')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Add New Venue
          </button>
        </div>
        
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('all')}
          >
            All Venues
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('available')}
          >
            Available
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === 'unavailable' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('unavailable')}
          >
            Unavailable
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {venues.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl text-gray-600">No venues found</p>
                <p className="mt-2 text-gray-500">Add your first venue to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues().map((venue) => (
                  <div 
                    key={venue.venue_id} 
                    className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                    onClick={() => router.push(`/admin/venues/${venue.venue_id}`)}
                  >
                    <div className="relative h-48 w-full">
                      <Image 
                        src={venue.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1469&auto=format&fit=crop'} 
                        alt={venue.name}
                        layout="fill"
                        objectFit="cover"
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded ${venue.availability ? 'bg-green-500' : 'bg-red-500'}`}>
                        {venue.availability ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="text-xl font-bold mb-2">{venue.name}</h2>
                      <p className="text-gray-600 mb-2">📍 {venue.location}</p>
                      <p className="text-gray-600 mb-2">👥 Capacity: {venue.capacity}</p>
                      <p className="text-gray-600 truncate">{venue.description}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-1">
                        {venue.facilities && venue.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded">
                            {facility}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-end items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/venues/${venue.venue_id}`);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VenuesPage;
