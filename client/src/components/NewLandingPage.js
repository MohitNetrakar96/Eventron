import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getUserToken } from '@/utils/getUserToken';
import { removeUserToken } from '@/utils/removeUserToken';
import Footer from './Footer';
import RotatingText from './RotatingText';

function NewLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Function to handle dropdown toggle
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to handle logout
  const handleLogout = () => {
    removeUserToken();
    setIsLoggedIn(false);
    setUserData(null);
    router.push('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, mobileMenuRef]);

  useEffect(() => {
    let isMounted = true;

    const checkLoginStatus = async () => {
      try {
        const userToken = getUserToken();
        if (!userToken) {
          if (isMounted) setIsLoggedIn(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_token: userToken,
            }),
          }
        );

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching user data:", error);
          setIsLoggedIn(false);
        }
      }
    };

    checkLoginStatus();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleBookEvents = () => {
    if (isLoggedIn) {
      router.push('/users/dashboard');
    } else {
      router.push('/users/signin');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-4 px-6 md:px-12 relative z-30">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-[color:var(--secondary-color)]">EVENT</span>
            <span className="text-white">X</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-[color:var(--secondary-color)]">HOME</a>
          <a href="/users/dashboard" className="hover:text-[color:var(--secondary-color)]">EVENTS</a>
          <a href="#" className="hover:text-[color:var(--secondary-color)]">ABOUT</a>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <a
                href="/users/dashboard"
                className="bg-[color:var(--secondary-color)] text-white px-4 py-2 rounded-full hover:bg-[color:var(--darker-secondary-color)] transition duration-300"
              >
                Dashboard
              </a>
              <div ref={dropdownRef} className="relative">
                <div
                  onClick={toggleDropdown}
                  className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition duration-300"
                >
                  {userData?.username ? userData.username.charAt(0).toUpperCase() : userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 bg-white rounded-md overflow-hidden shadow-lg z-[9999] w-48 pointer-events-auto">
                    <div className="px-4 py-3 cursor-default hover:bg-[color:var(--primary-color)]">
                      <div className="text-gray-800 font-medium">Signed in as</div>
                      <div className="text-gray-600 truncate">
                        {userData?.username || userData?.name || 'User'}
                      </div>
                    </div>
                    <hr />
                    <div className="px-4 py-3 cursor-default hover:bg-[color:var(--primary-color)]">
                      <div className="text-gray-800 font-medium">Email</div>
                      <div className="text-gray-600 truncate">
                        {userData?.email || 'No email available'}
                      </div>
                    </div>
                    <hr />
                    <div
                      onClick={() => router.push('/users/dashboard')}
                      className="py-2 px-4 hover:bg-[color:var(--primary-color)] cursor-pointer"
                    >
                      <span className="text-gray-800">Dashboard</span>
                    </div>
                    <div
                      onClick={handleLogout}
                      className="py-2 px-4 hover:bg-[color:var(--darker-secondary-color)] hover:text-white cursor-pointer"
                    >
                      <span className="text-gray-800 hover:text-white">Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <a
                href="/users/signin"
                className="hover:text-[color:var(--secondary-color)]"
              >
                Login
              </a>
              <a
                href="/users/signup"
                className="bg-[color:var(--secondary-color)] text-white px-4 py-2 rounded-full hover:bg-[color:var(--darker-secondary-color)] transition duration-300"
              >
                Sign Up
              </a>
              <a
                href="/admin/auth"
                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-300"
              >
                Event Manager
              </a>
            </div>
          )}
        </div>

        {/* Mobile Menu Button - Only One at the right side */}
        <div className="md:hidden">
          <button
            className="mobile-menu-button focus:outline-none z-50"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Glassmorphism Effect */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-screen w-full sm:max-w-sm z-40 transform transition-transform duration-500 ease-in-out backdrop-blur-xl bg-black bg-opacity-80 border-l border-gray-800 shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center mb-8 pt-2">             
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-gray-800 transition duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Links */}
          <div className="flex flex-col space-y-6 mb-8">
            <a
              href="#"
              className="text-xl font-medium border-b border-gray-800 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300"
              onClick={toggleMobileMenu}
            >
              HOME
            </a>
            <a
              href="/users/dashboard"
              className="text-xl font-medium border-b border-gray-800 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300"
              onClick={toggleMobileMenu}
            >
              EVENTS
            </a>
            <a
              href="#"
              className="text-xl font-medium border-b border-gray-800 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300"
              onClick={toggleMobileMenu}
            >
              ABOUT
            </a>
          </div>

          {/* Mobile Menu User Section */}
          <div className="mt-auto backdrop-blur-md bg-white bg-opacity-10 rounded-xl p-4">
            {isLoggedIn ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                    {userData?.username ? userData.username.charAt(0).toUpperCase() : userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{userData?.username || userData?.name || 'User'}</p>
                    <p className="text-sm text-gray-400 truncate">{userData?.email || 'No email available'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/users/dashboard"
                    className="bg-gray-800 text-white px-4 py-2 rounded-full text-center hover:bg-gray-700 transition duration-300"
                    onClick={toggleMobileMenu}
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="bg-[color:var(--secondary-color)] text-white px-4 py-2 rounded-full hover:bg-[color:var(--darker-secondary-color)] transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <p className="text-center font-medium">Join EventX today</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/users/signin"
                    className="bg-gray-800 text-white px-4 py-2 rounded-full text-center hover:bg-gray-700 transition duration-300"
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </a>
                  <a
                    href="/users/signup"
                    className="bg-[color:var(--secondary-color)] text-white px-4 py-2 rounded-full text-center hover:bg-[color:var(--darker-secondary-color)] transition duration-300"
                    onClick={toggleMobileMenu}
                  >
                    Sign Up
                  </a>
                </div>
                <a
                  href="/admin/auth"
                  className="bg-purple-600 text-white px-4 py-2 rounded-full text-center hover:bg-purple-700 transition duration-300"
                  onClick={toggleMobileMenu}
                >
                  Event Manager
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} EventX. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070")',
              filter: 'brightness(0.4)',
            }}
          ></div>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          {/* Gradient Fade at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover <span className="inline-flex items-center backdrop-blur-md bg-white bg-opacity-10 px-3 py-1 rounded-md">
                <span className="mr-1">&</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span> Join
            </h1>
            <h1 className="text-4xl md:text-6xl font-bold mb-12">
              Upcoming <span className="text-[color:var(--secondary-color)]">→</span>
              <RotatingText
                texts={['Conferences', 'Workshops', 'Cultural Events', 'Technical Fests']}
                mainClassName="px-4 py-3 mt-5 md:mt-2 md:py-2 backdrop-blur-sm bg-opacity-10 bg-white shadow-xl text-white overflow-hidden rounded-lg inline-flex"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </h1>

            <div className="mb-12">
              <button
                onClick={handleBookEvents}
                className="bg-[color:var(--secondary-color)] text-white px-8 py-3 rounded-full hover:bg-[color:var(--darker-secondary-color)] transition duration-300 flex items-center"
              >
                Explore Campus Events
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the page components (Ticket Section, Discover Events, etc.) remain unchanged */}
      {/* Ticket Section */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">DECIDE TO JOIN THE EVENT</h2>
          <p className="text-gray-400 mb-8 max-w-2xl">If you want to book an event and explore the details of the event, this is the right place to get your ticket and join us.</p>

          <button
            onClick={handleBookEvents}
            className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition duration-300 flex items-center"
          >
            GET TICKET
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="mt-8 relative">
            <div className="absolute right-0 top-0 transform translate-x-1/4 -translate-y-1/4 rotate-12">
              <div className="bg-[color:var(--secondary-color)] text-white p-4 rounded-lg transform rotate-12 shadow-lg">
                <div className="border-2 border-dashed border-white p-4">
                  <h3 className="text-xl font-bold">TICKET</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-sm">EVENT</p>
                      <p className="font-bold">EVENTX</p>
                    </div>
                    <div>
                      <p className="text-sm">DATE</p>
                      <p className="font-bold">APR 30</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Events Section */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">DISCOVER UPCOMING EVENTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-purple-600 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">EXPLORE THE LOCATION</h3>
              <p className="text-gray-200 mb-6">Our venue offers state-of-the-art facilities for all types of events. Explore the space and plan your perfect event.</p>
              <button className="flex items-center text-white hover:text-gray-200 transition duration-300">
                EXPLORE THE LOCATION
                <div className="ml-2 bg-white rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden relative">
              <div className="w-full h-48 overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dqctbemge/image/upload/v1745265163/eventron/dq6ru67oc8tubucnv7yc.jpg"
                  alt="EventX promotional image"
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2 rounded-lg overflow-hidden">
              <div className="w-full h-64 overflow-hidden rounded-lg">
                <video
                  src="https://res.cloudinary.com/dqctbemge/video/upload/v1745260089/AQMfAKWlwWm7A3SxGCq-mH4rVh06kcsh4u8yDYKHJykrh3vCHIxlsaTtsISJg4iyrB0IAcGH8Nvf7f1HDfogIVOnCtfgp3xU4CCZ7CY_1_wggrdf.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>

            <div className="bg-[color:var(--secondary-color)] rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">MAKE A RESERVATION NOW FOR UPCOMING EVENTS</h3>
                <p className="text-gray-200 mb-6">Don't miss out on our exciting upcoming events. Reserve your spot today!</p>
              </div>
              <button className="flex items-center text-white hover:text-gray-200 transition duration-300">
                EXPLORE
                <div className="ml-2 bg-white rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[color:var(--secondary-color)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Interactive Features Showcase */}
      <section className="px-6 md:px-12 py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">POWERFUL EVENT MANAGEMENT</h2>
          <p className="text-gray-400 mb-12 max-w-2xl">Discover how EventX transforms your event planning experience with these powerful features</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Analytics Dashboard */}
            <div className="bg-gray-800 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20">
              <div className="bg-[color:var(--secondary-color)] rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">ANALYTICS & INSIGHTS</h3>
              <p className="text-gray-400 mb-4">Gain valuable insights with our powerful analytics dashboard. Track attendance, engagement, and revenue in real-time.</p>
              <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Attendance Rate</span>
                  <span className="text-sm font-bold">87%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div className="bg-[color:var(--secondary-color)] h-2.5 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>

            {/* Feature 2: Calendar Integration */}
            <div className="bg-gray-800 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20">
              <div className="bg-[color:var(--secondary-color)] rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">CENTRALIZED CALENDAR</h3>
              <p className="text-gray-400 mb-4">Manage all your events in one place with our centralized calendar. Easily check for venue conflicts and availability.</p>
              <div className="grid grid-cols-7 gap-1 mt-4">
                {Array(7).fill().map((_, i) => (
                  <div key={i} className="text-center text-xs text-gray-500">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</div>
                ))}
                {Array(31).fill().map((_, i) => (
                  <div key={i + 7}
                    className={`text-center text-xs p-1 rounded-full ${i === 14 || i === 21 ? 'bg-[color:var(--secondary-color)] text-white' : 'text-gray-400'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 3: Approval Workflow */}
            <div className="bg-gray-800 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20">
              <div className="bg-[color:var(--secondary-color)] rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">APPROVAL WORKFLOW</h3>
              <p className="text-gray-400 mb-4">Streamlined event approval process for organizations. Submit requests, track status, and receive notifications.</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Submit</span>
                </div>
                <div className="flex-1 h-1 bg-gray-700 mx-1">
                  <div className="bg-green-500 h-1 w-full"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Review</span>
                </div>
                <div className="flex-1 h-1 bg-gray-700 mx-1">
                  <div className="bg-green-500 h-1 w-2/3"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Approve</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Ticket Section */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">GET YOUR FIRST TICKET</h2>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <button
                onClick={handleBookEvents}
                className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition duration-300 flex items-center"
              >
                GET TICKET
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex items-center">
              <div className="bg-[color:var(--secondary-color)] rounded-full p-4 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400">GET NOTIFIED ABOUT NEW EVENTS</p>
                <p className="text-sm">Subscribe to our newsletter to stay updated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">
                <span className="text-[color:var(--secondary-color)]">EVENT</span>
                <span className="text-white">X</span>
              </h2>
              <p className="text-gray-400 mb-4">BE INSPIRED TO NEWSLETTER</p>
              <div className="flex">
                <button className="bg-[color:var(--secondary-color)] rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold mb-4">LINKS</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Home</a></li>
                  <li><a href="#" className="hover:text-white">Events</a></li>
                  <li><a href="#" className="hover:text-white">About</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4">EVENTS</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Conferences</a></li>
                  <li><a href="#" className="hover:text-white">Workshops</a></li>
                  <li><a href="#" className="hover:text-white">Seminars</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4">CONTACT</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>info@eventron.com</li>
                  <li>+1 234 567 890</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-4">FOLLOW US</h3>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-[color:var(--secondary-color)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-[color:var(--secondary-color)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-[color:var(--secondary-color)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} EventX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default NewLandingPage;
