import AdminNavBar from "@/components/AdminNavBar";
import Dashboard_Filter from "@/components/Dashboard_Filter";
import Popup_Filter from "@/components/Popup_Filter";
import { getAdminToken } from "@/utils/getAdminToken";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

function AdminPastEventsPage() {
    const router = useRouter();
    const adminIdCookie = getAdminToken();

    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [popupFilterOpen, setPopupFilterOpen] = useState(false);

    // Helper function to parse event dates
    const parseEventDate = (dateString) => {
        try {
            const [day, month, year] = dateString.split('/');
            const fullYear = year.length === 2 ? `20${year}` : year;
            const eventDate = new Date(`${fullYear}-${month}-${day}`);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate;
        } catch (error) {
            console.error('Error parsing date:', error, dateString);
            return null;
        }
    };

    const fetchAllEvents = async () => {
        try {
            console.log('Fetching events for admin past events page...');
            
            // First try to get all events
            const allEventsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/events/all`
            );
            
            if (!allEventsResponse.ok) {
                throw new Error(`${allEventsResponse.status} ${allEventsResponse.statusText}`);
            }
            
            const allEventsData = await allEventsResponse.json();
            console.log(`Received ${allEventsData.length} events from all events endpoint`);
            
            // Filter for past events only
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const pastEvents = allEventsData.filter(event => {
                const eventDate = parseEventDate(event.date);
                return eventDate && eventDate < today;
            });
            
            console.log(`Found ${pastEvents.length} past events`);
            setAllEvents(pastEvents);
            setFilteredEvents(pastEvents);
        } catch (error) {
            console.error("Error fetching events:", error.message);
            setAllEvents([]);
            setFilteredEvents([]);
        }
    };

    useEffect(() => {
        fetchAllEvents()
            .then(() => {
                console.log('Events fetched successfully');
            })
            .catch(error => {
                console.error('Error in fetchAllEvents:', error);
            });
    }, []);

    const [filterOptions, setFilterOptions] = useState({
        keyword: "",
        category: "",
        dateRange: ""
    });

    // Update filteredEvents state whenever allEvents or filterOptions change
    useEffect(() => {
        console.log(`Filtering ${allEvents?.length || 0} events with criteria:`, filterOptions);
        
        if (!allEvents || allEvents.length === 0) {
            console.log('No events to filter');
            setFilteredEvents([]);
            return;
        }
        
        // Make a copy of all events to avoid modifying the original array
        const allEventsWithDefaults = allEvents.map(event => ({
            ...event,
            // Ensure price is 0 if not set (free event)
            price: event.price || 0
        }));
        
        const newFilteredEvents = allEventsWithDefaults.filter((event) => {
            // Skip null or undefined events
            if (!event || !event.name) {
                console.log('Skipping invalid event:', event);
                return false;
            }
            
            // Check if keyword filter matches
            if (
                filterOptions.keyword && 
                filterOptions.keyword.toLowerCase() &&
                !event.name.toLowerCase().includes(filterOptions.keyword.toLowerCase()) &&
                !(event.venue && event.venue.toLowerCase().includes(filterOptions.keyword.toLowerCase()))
            ) {
                return false;
            }

            // Check if category filter matches
            if (
                filterOptions.category &&
                event.category !== filterOptions.category
            ) {
                return false;
            }

            // Check if date range filter matches
            if (filterOptions.dateRange) {
                const date = filterOptions.dateRange;
                // Split the date string into an array of substrings
                const dateParts = event.date.split("/");
                // Rearrange the array elements to get yyyy-mm-dd format
                const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                if (formattedDate < date) {
                    return false;
                }
            }

            return true;
        });
        
        console.log(`After filtering: ${newFilteredEvents.length} events match criteria`);
        setFilteredEvents(newFilteredEvents);
    }, [allEvents, filterOptions]);

    const handleFilterClear = () => {
        setFilterOptions({
            keyword: "",
            category: "",
            dateRange: ""
        });
        setFilteredEvents(allEvents);
        setPopupFilterOpen(false);
    };

    return (
        <div className="pt-20 lg:pt-8 overflow-y-hidden bg-[color:var(--primary-color)]">
            <AdminNavBar />
            <div className="flex m-auto">
                <div className="flex mx-auto container ">
                    <div className="flex m-auto overflow-y-hidden gap-4 lg:gap-8 w-full h-[calc(88vh)]">
                        {/* Render the regular filter for medium screens and above */}
                        <div className="hidden md:flex flex-col p-4 sticky top-0 w-1/6 md:w-1/4">
                            <Dashboard_Filter
                                filterOptions={filterOptions}
                                setFilterOptions={setFilterOptions}
                                handleFilterClear={handleFilterClear}
                            />
                        </div>
                        {/* Render the popup filter for small screens */}
                        {popupFilterOpen && (
                            <div className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white rounded-lg p-4 w-5/6">
                                    <Popup_Filter
                                        filterOptions={filterOptions}
                                        setFilterOptions={setFilterOptions}
                                        handleFilterClear={handleFilterClear}
                                        handleClose={() =>
                                            setPopupFilterOpen(false)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                        {/* Render the main content of the dashboard */}
                        <div className="flex w-full md:w-3/4 mx-auto justify-between container">
                            <div className="p-4 overflow-y-auto w-full h-[calc(80vh)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-medium">Past Events</h2>
                                    <button
                                        onClick={() => router.push('/admin/dashboard')}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredEvents.length === 0 ? (
                                        <p>No past events</p>
                                    ) : (
                                        filteredEvents.map((event) => (
                                            <div
                                                onClick={() => {
                                                    router.push(
                                                        `/event/${event.event_id}/adminevents`
                                                    );
                                                }}
                                                className="hover:scale-105 cursor-pointer transition-all mt-5 bg-[color:var(--white-color)] rounded-lg shadow-md px-3 py-3 grayscale opacity-80"
                                                key={event._id || event.event_id}
                                            >
                                                <div className="relative h-[25rem]">
                                                    {event.profile && (
                                                        <Image
                                                            fill
                                                            className="object-cover h-full w-full rounded-md"
                                                            src={event.profile}
                                                            alt=""
                                                            sizes="(min-width: 640px) 100vw, 50vw"
                                                            priority
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-row justify-between items-start mt-4">
                                                    <div className="px-2">
                                                        <p className="text-sm text-gray-800 font-bold">
                                                            {event.name.length > 30
                                                                ? event.name.slice(0, 30) + "..."
                                                                : event.name}
                                                        </p>
                                                        <p className="text-sm text-gray-800">
                                                            {event.venue}
                                                        </p>
                                                        <p className="text-sm text-gray-800">
                                                            {event.date}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col justify-end items-center">
                                                        <span className="w-full flex flex-row items-center">
                                                            <FaUsers />
                                                            <span className="ml-2 text-sm">
                                                                4,92
                                                            </span>
                                                        </span>
                                                        <p className="text-sm text-gray-800 mt-2">
                                                            {event.price === 0 ? (
                                                                <span className="whitespace-nowrap bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                                                    Open to All
                                                                </span>
                                                            ) : (
                                                                <strong className="whitespace-nowrap">
                                                                    ₹ {event.price}
                                                                </strong>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Bottom buttons */}
                        <div className="fixed bottom-3 right-3">
                            {/* Button to open the popup filter */}
                            <button
                                onClick={() => setPopupFilterOpen(true)}
                                className="md:hidden flex items-center justify-center w-[4rem] h-[4rem] text-white rounded-full bg-[color:var(--darker-secondary-color)] hover:bg-[color:var(--secondary-color)] hover:scale-105 shadow-lg cursor-pointer transition-all ease-in-out focus:outline-none"
                                title="Filter Events"
                            >
                                <RxHamburgerMenu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPastEventsPage;
