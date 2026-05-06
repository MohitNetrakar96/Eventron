import React from 'react';
import Head from 'next/head';
import UserNavBar from '@/components/UserNavBar';
import Footer from '@/components/Footer';
import UserEventForm from '@/components/UserEventForm';
import { useRouter } from 'next/router';
import { getUserToken } from '@/utils/getUserToken';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const RequestEventPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const userToken = getUserToken();
    
    if (!userToken) {
      router.push('/auth');
      return;
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <UserNavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Request an Event | Eventron</title>
        <meta name="description" content="Submit your event request for approval" />
      </Head>

      <UserNavBar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <div className="md:w-1/2 lg:w-2/5">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">How It Works</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Fill out the event request form with all required details</li>
                <li>Submit your request for administrative review</li>
                <li>Administrators will review your event request</li>
                <li>You'll receive notification when your event is approved or rejected</li>
                <li>Approved events will appear on the official calendar</li>
              </ol>
            </div>
            
            <div className="relative h-80 rounded-lg overflow-hidden shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1470&auto=format&fit=crop"
                alt="Event planning"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
          
          <div className="md:w-1/2 lg:w-3/5">
            <UserEventForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestEventPage;
