import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import UserNavBar from '@/components/UserNavBar';
import AdminNavBar from '@/components/AdminNavBar';
import Footer from '../../components/Footer';
import EventCalendar from '../../components/Calendar/EventCalendar';
import { useRouter } from 'next/router';
import { getUserToken } from '@/utils/getUserToken';
import { getAdminToken } from '@/utils/getAdminToken';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userToken = getUserToken();
    const adminToken = getAdminToken();
    const { auth } = router.query;
    
    // Set admin status based on token or query parameter
    setIsAdmin(!!adminToken || auth === 'admin');
    
    // If no authentication at all, redirect to appropriate login
    if (!userToken && !adminToken) {
      // If we're coming from admin pages or have admin in query, redirect to admin login
      if (auth === 'admin' || document.referrer.includes('/admin')) {
        router.push('/admin/auth');
      } else {
        router.push('/users/signin');
      }
      return;
    }

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/all`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = () => {
    if (filter === 'all') return events;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time component for accurate date comparison
    
    return events.filter(event => {
      try {
        const [day, month, year] = event.date.split('/');
        // Ensure proper year format (add '20' prefix for YY format if needed)
        const fullYear = year.length === 2 ? `20${year}` : year;
        const eventDate = new Date(`${fullYear}-${month}-${day}`);
        eventDate.setHours(0, 0, 0, 0); // Reset time component for accurate comparison
        
        if (filter === 'upcoming') {
          return eventDate >= today;
        } else if (filter === 'past') {
          return eventDate < today;
        }
      } catch (error) {
        console.error('Error parsing date:', error, event);
      }
      return true;
    });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Event Calendar | Eventron</title>
        <meta name="description" content="View all events in a calendar format" />
      </Head>

      {isAdmin ? <AdminNavBar /> : <UserNavBar />}

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Event Calendar</h1>
        
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('all')}
          >
            All Events
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('upcoming')}
          >
            Upcoming Events
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('past')}
          >
            Past Events
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {events.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl text-gray-600">No events found</p>
              </div>
            ) : (
              <EventCalendar events={filteredEvents()} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CalendarPage;
