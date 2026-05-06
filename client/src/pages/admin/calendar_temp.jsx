import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import UserNavBar from '@/components/UserNavBar';
import AdminNavBar from '@/components/AdminNavBar';
import Footer from '../../components/Footer';
import EventCalendar from '../../components/Calendar/EventCalendar';
import { useRouter } from 'next/router';
import { getUserToken } from '@/utils/getUserToken';
import { getAdminToken } from '@/utils/getAdminToken';

const AdminCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [isAdmin, setIsAdmin] = useState(false);
  const [showConflictTester, setShowConflictTester] = useState(false);
  const [testEvent, setTestEvent] = useState({
    name: '',
    venue: '',
    date: '',
    time: '',
    organizer: ''
  });
  const [conflictResult, setConflictResult] = useState(null);
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

    // Enable conflict tester only for admin users
    setShowConflictTester(!!adminToken);

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/all`);
        if (response.ok) {
          const data = await response.json();
          
          // Ensure all events have proper price handling
          const processedData = data.map(event => ({
            ...event,
            price: event.price || 0 // Ensure free events have price=0
          }));
          
          setEvents(processedData);
        } else {
          console.error('Failed to fetch events');
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  const filteredEvents = () => {
    if (filter === 'all') return events;
    
    const today = new Date();
    
    return events.filter(event => {
      try {
        const [day, month, year] = event.date.split('/');
        // Assuming YY format, add '20' prefix if needed
        const fullYear = year.length === 2 ? `20${year}` : year;
        const eventDate = new Date(`${fullYear}-${month}-${day}`);
        
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

  const handleTestInputChange = (e) => {
    const { name, value } = e.target;
    setTestEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkForConflict = async () => {
    // Format date for API if needed
    if (!testEvent.name || !testEvent.venue || !testEvent.date || !testEvent.time) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/check-conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEvent),
      });
      
      if (response.ok) {
        const result = await response.json();
        setConflictResult(result);
      } else {
        setConflictResult({
          hasConflict: false,
          message: 'Error checking for conflicts. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      setConflictResult({
        hasConflict: false,
        message: 'Error checking for conflicts. Please try again.'
      });
    }
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
              <div className="bg-white p-6 rounded-lg shadow-md">
                <EventCalendar events={filteredEvents()} />
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Admin-specific Conflict Tester */}
      {showConflictTester && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Test for Venue Conflicts</h2>
            <p className="mb-4 text-gray-600">Use this tool to check if a venue is available on a specific date and time.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={testEvent.name}
                  onChange={handleTestInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={testEvent.venue}
                  onChange={handleTestInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (DD/MM/YY)</label>
                <input
                  type="text"
                  name="date"
                  value={testEvent.date}
                  onChange={handleTestInputChange}
                  placeholder="31/12/23"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (HH:MM)</label>
                <input
                  type="text"
                  name="time"
                  value={testEvent.time}
                  onChange={handleTestInputChange}
                  placeholder="14:30"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <input
                  type="text"
                  name="organizer"
                  value={testEvent.organizer}
                  onChange={handleTestInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <button
              onClick={checkForConflict}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Availability
            </button>
            
            {conflictResult !== null && (
              <div className={`mt-4 p-4 rounded ${conflictResult.hasConflict ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                <p className="font-bold">{conflictResult.hasConflict ? 'Venue Conflict Detected!' : 'Venue Available!'}</p>
                <p>{conflictResult.message}</p>
                {conflictResult.hasConflict && conflictResult.conflictingEvents && (
                  <div className="mt-2">
                    <p className="font-semibold">Conflicting Events:</p>
                    <ul className="list-disc pl-5">
                      {conflictResult.conflictingEvents.map((event, index) => (
                        <li key={index}>
                          {event.name} at {event.time} ({event.organizer})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Admin-only Add Event button */}
      {isAdmin && (
        <div className="fixed bottom-3 right-3">
          <button
            onClick={() => router.push("/admin/eventform")}
            className="flex items-center justify-center w-[4rem] h-[4rem] text-white rounded-full bg-[color:var(--darker-secondary-color)] hover:bg-[color:var(--secondary-color)] hover:scale-105 shadow-lg cursor-pointer transition-all ease-in-out focus:outline-none"
            title="Create Event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AdminCalendarPage;
