import { getAdminToken } from "@/utils/getAdminToken";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminDropdown from "@/components/AdminDropdown";

import { useRef } from "react";
export default function NavBar() {
    const router = useRouter();

    // fetch the admin data as soon as the page loads
    const fetchAdminData = async () => {
        try {
            const adminIdCookie = getAdminToken();
            // If cookie was manually removed from browser
            if (!adminIdCookie) {
                console.error("No cookie found! Please authenticate");
                // redirect to signin
                router.push("/admin/auth");
                return; // Exit early
            }
            
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/admin/details`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            admin_id: adminIdCookie,
                        }),
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`${response.status} ${response.statusText}`);
                }

                try {
                    const data = await response.json();
                    // console.log(data);
                    setAdminData(data);
                } catch (error) {
                    console.error("Invalid JSON string:", error.message);
                }
            } catch (error) {
                console.error("Server connection error:", error.message);
                // Set a default admin data to prevent UI errors
                setAdminData({
                    name: "Admin",
                    email: "admin@example.com",
                    // Add other default properties as needed
                });
                // Don't redirect - allow user to continue using the app
            }
        } catch (error) {
            console.error("Error in admin data flow:", error.message);
            // Handle error, e.g., show a message to the user
        }
    };

    const [adminData, setAdminData] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    // Close mobile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuRef]);

    return (
        <div className="mb-[8vh]">
            <header className="bg-[color:var(--white-color)] fixed top-0 z-50 w-full shadow-md text-[color:var(--darker-secondary-color)]">
                <div className="flex items-center justify-between p-4 lg:hidden relative">
                    {/* Hamburger Toggle */}
                    <button
                        className="mobile-menu-button focus:outline-none z-50"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                    {/* Centered Logo */}
                    <div
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 cursor-pointer z-10"
                    >
                        <Image
                            src="/favicon_io/android-chrome-192x192.png"
                            width={40}
                            height={40}
                            alt="Logo"
                            className="h-8 w-8"
                        />
                        <h1 className="text-black font-bold text-2xl">
                            <span className="text-[color:var(--darker-secondary-color)]">EVENT</span>
                            <span className="text-black">X</span>
                        </h1>
                    </div>
                </div>
                {/* Mobile Slide-out Menu */}
                <div
                    ref={mobileMenuRef}
                    className={`fixed top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-500 ease-in-out backdrop-blur-xl bg-white bg-opacity-95 border-r border-gray-200 shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex flex-col h-full p-6">
                        <div className="flex flex-col space-y-6 mb-8 mt-8">
                            <a onClick={() => {router.push('/'); setMobileMenuOpen(false);}} className="text-lg font-medium border-b border-gray-200 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300 cursor-pointer">Home</a>
                            <a onClick={() => {router.push('/admin/dashboard'); setMobileMenuOpen(false);}} className="text-lg font-medium border-b border-gray-200 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300 cursor-pointer">Dashboard</a>
                            <a onClick={() => {router.push('/admin/calendar'); setMobileMenuOpen(false);}} className="text-lg font-medium border-b border-gray-200 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300 cursor-pointer">Calendar</a>
                            <a onClick={() => {router.push('/admin/venues'); setMobileMenuOpen(false);}} className="text-lg font-medium border-b border-gray-200 pb-2 hover:text-[color:var(--secondary-color)] transition duration-300 cursor-pointer">Venues</a>
                        </div>
                        <div className="mt-auto">
                            <AdminDropdown adminData={adminData} />
                        </div>
                    </div>
                </div>
                {/* Desktop Nav */}
                <div className="container mx-auto hidden lg:flex items-center flex-row justify-between p-4">
                    <div
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-x-3 cursor-pointer"
                    >
                        <Image
                            src="/favicon_io/android-chrome-192x192.png"
                            width={500}
                            height={500}
                            alt="Logo"
                            className="h-8 w-8"
                        />
                        <h1 className="m-2 text-black font-bold text-4xl">
                            <span className="text-[color:var(--darker-secondary-color)]">EVENT</span>
                            <span className="text-black">X</span>
                        </h1>
                    </div>
                    <nav className="text-sm">
                        <ul className="flex items-center">
                            <li onClick={() => router.push("/")} className="mr-4 cursor-pointer"><a>Home</a></li>
                            <li onClick={() => router.push("/admin/dashboard")} className="mr-4 cursor-pointer"><a>Dashboard</a></li>
                            <li onClick={() => router.push("/admin/calendar")} className="mr-4 cursor-pointer"><a>Calendar</a></li>
                            <li onClick={() => router.push("/admin/venues")} className="mr-4 cursor-pointer"><a>Venues</a></li>
                            <AdminDropdown adminData={adminData} />
                        </ul>
                    </nav>
                </div>
            </header>
        </div>
    );
}
