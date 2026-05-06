import { getAdminToken } from "@/utils/getAdminToken";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";

const CreateEvent = () => {
    const router = useRouter();
    const admin_id = getAdminToken();
    const { venue: preselectedVenueId } = router.query;

    const [formData, setFormData] = useState({
        name: "",
        venue: "",
        venue_id: "",
        organizer: "",
        datetime: "",
        endtime: "", // Added end time for venue booking
        price: "",
        profile: "",
        cover: "",
        description: "",
    });
    
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [venueConflict, setVenueConflict] = useState(false);
    const [venueAvailabilityChecked, setVenueAvailabilityChecked] = useState(false);

    // Fetch venues when component mounts
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues`);
                if (response.ok) {
                    const data = await response.json();
                    setVenues(data);
                    
                    // If a venue was preselected (from the venues page)
                    if (preselectedVenueId) {
                        const selectedVenue = data.find(v => v.venue_id === preselectedVenueId);
                        if (selectedVenue) {
                            setFormData(prev => ({
                                ...prev,
                                venue: selectedVenue.name,
                                venue_id: selectedVenue.venue_id
                            }));
                        }
                    }
                } else {
                    console.error('Failed to fetch venues');
                }
            } catch (error) {
                console.error('Error fetching venues:', error);
            }
        };

        fetchVenues();
    }, [preselectedVenueId]);

    // Check venue availability when date/time changes
    useEffect(() => {
        const checkVenueAvailability = async () => {
            if (!formData.venue_id || !formData.datetime || !formData.endtime) {
                setVenueAvailabilityChecked(false);
                return;
            }
            
            try {
                setLoading(true);
                const startDate = new Date(formData.datetime);
                const endDate = new Date(formData.endtime);
                
                const formattedStartDate = startDate.toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                });
                
                const formattedStartTime = startDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                });
                
                const formattedEndTime = endDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                });
                
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/check-availability`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        venue_id: formData.venue_id,
                        date: formattedStartDate,
                        start_time: formattedStartTime,
                        end_time: formattedEndTime
                    }),
                });
                
                const data = await response.json();
                setVenueConflict(!data.available);
                setVenueAvailabilityChecked(true);
            } catch (error) {
                console.error('Error checking venue availability:', error);
            } finally {
                setLoading(false);
            }
        };
        
        const debounceTimeout = setTimeout(() => {
            if (formData.venue_id && formData.datetime && formData.endtime) {
                checkVenueAvailability();
            }
        }, 500);
        
        return () => clearTimeout(debounceTimeout);
    }, [formData.venue_id, formData.datetime, formData.endtime]);

    // function to handle the event form submission
    const handleEventFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            if (venueConflict) {
                alert("This venue is not available at the selected time. Please choose another time or venue.");
                return;
            }
            
            console.log("Form data being submitted:", formData);
    
            // Format date and time for server request
            const startDate = new Date(formData.datetime);
            const endDate = new Date(formData.endtime);
            
            const formattedDate = startDate.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
            
            const formattedStartTime = startDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
            
            const formattedEndTime = endDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
            
            const date = `${formattedDate}`;
            const start_time = `${formattedStartTime}`;
            const end_time = `${formattedEndTime}`;
    
            // Set up request body with form data and admin ID
            const requestBody = {
                name: formData.name,
                venue: formData.venue,
                venue_id: formData.venue_id,
                organizer: formData.organizer,
                date: date,
                time: start_time,
                end_time: end_time,
                description: formData.description,
                price: formData.price,
                profile: formData.profile || undefined,
                cover: formData.cover || undefined,
                admin_id: admin_id,
            };
            
            console.log("Request body:", requestBody);
            
            // Send POST request to server with request body
            console.log("Sending request to:", `${process.env.NEXT_PUBLIC_API_URL}/post/event`);
            
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/post/event`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            
            console.log("Response status:", response.status);
            
            // Get response text first for debugging
            const responseText = await response.text();
            console.log("Response text:", responseText);
            
            // Parse JSON if possible
            let data;
            try {
                data = JSON.parse(responseText);
                console.log("Parsed response data:", data);
            } catch (parseError) {
                console.error("Error parsing response:", parseError);
                alert("Error parsing server response. Check console for details.");
                return;
            }
            
            if (response.status === 200) {
                // If request was successful, show success message and redirect to dashboard
                alert("Event Created Successfully");
                router.push("/admin/dashboard");
            } else {
                // If request failed, show error message
                console.error(`Failed with status code ${response.status}:`, data);
                alert(`Failed to create event: ${data.msg || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(`Error creating event: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="flex h-full text-left bg-white rounded-lg shadow-lg items-center overflow-y-auto max-h-[80vh]">
            <div className="p-4 md:p-6 lg:p-8 w-full">
                <h1 className="text-2xl font-bold text-gray-700 mb-4">
                    Create an Event
                </h1>
                <form
                    id="event-form"
                    onSubmit={handleEventFormSubmit}
                    className="space-y-4"
                >
                    {venueAvailabilityChecked && venueConflict && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                            This venue is not available at the selected time. Please choose another time or venue.
                        </div>
                    )}
                    {venueAvailabilityChecked && !venueConflict && formData.venue_id && formData.datetime && formData.endtime && (
                        <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                            Venue is available at the selected time!
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="name"
                            className="block font-medium text-gray-700 text-sm"
                        >
                            Title:
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="venue"
                                className="block font-medium text-gray-700 text-sm"
                            >
                                Venue:
                            </label>
                            <select
                                id="venue"
                                name="venue_id"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.venue_id}
                                onChange={(e) => {
                                    const selectedVenue = venues.find(v => v.venue_id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        venue_id: e.target.value,
                                        venue: selectedVenue ? selectedVenue.name : ''
                                    });
                                    setVenueAvailabilityChecked(false);
                                }}
                                required
                            >
                                <option value="">Select a venue</option>
                                {venues.map((venue) => (
                                    <option 
                                        key={venue.venue_id} 
                                        value={venue.venue_id}
                                        disabled={!venue.availability}
                                    >
                                        {venue.name} ({venue.location})
                                    </option>
                                ))}
                            </select>
                            {formData.venue_id && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {venues.find(v => v.venue_id === formData.venue_id)?.description || ''}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="organizer"
                                className="block font-medium text-gray-700 text-sm"
                            >
                                Organizer:
                            </label>
                            <input
                                type="text"
                                id="organizer"
                                name="organizer"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.organizer}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="datetime"
                                className="block font-medium text-gray-700 text-sm"
                            >
                                Start Date and Time:
                            </label>
                            <input
                                type="datetime-local"
                                id="datetime"
                                name="datetime"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.datetime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="endtime"
                                className="block font-medium text-gray-700 text-sm"
                            >
                                End Date and Time:
                            </label>
                            <input
                                type="datetime-local"
                                id="endtime"
                                name="endtime"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.endtime}
                                onChange={handleChange}
                                min={formData.datetime}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="price"
                                className="block font-medium text-gray-700 text-sm"
                            >
                                Price:
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                min="0"
                                max="3000"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700 text-sm mb-1">
                                Description:
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.description}
                                rows="3"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <ImageUploader
                                label="Event Profile Image"
                                onImageUpload={(url) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        profile: url
                                    }));
                                }}
                                existingImageUrl={formData.profile}
                            />
                        </div>
                        <div>
                            <ImageUploader
                                label="Event Cover Image"
                                onImageUpload={(url) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        cover: url
                                    }));
                                }}
                                existingImageUrl={formData.cover}
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            disabled={loading || (venueAvailabilityChecked && venueConflict)}
                        >
                            {loading ? "Checking availability..." : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
