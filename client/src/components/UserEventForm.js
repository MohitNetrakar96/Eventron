import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUserToken } from '@/utils/getUserToken';
import ImageUploader from './ImageUploader';
import MultipleImageUploader from './MultipleImageUploader';

const UserEventForm = () => {
    const router = useRouter();
    const user_id = getUserToken();
    const { venue: preselectedVenueId } = router.query;

    const [formData, setFormData] = useState({
        name: '',
        venue: '',
        venue_id: '',
        organizer: '',
        datetime: '',
        endtime: '',
        price: '',
        profile: '',
        cover: '',
        description: '',
        images: [],
    });
    
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [venueConflict, setVenueConflict] = useState(false);
    const [venueAvailabilityChecked, setVenueAvailabilityChecked] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    // Fetch venues when component mounts
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues`);
                if (response.ok) {
                    const data = await response.json();
                    setVenues(data);
                    
                    // If a venue was preselected
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // function to handle the event form submission
    const handleEventFormSubmit = async (e) => {
        e.preventDefault();
        
        if (venueConflict) {
            setError("This venue is not available at the selected time. Please choose another time or venue.");
            return;
        }

        setLoading(true);
        setError('');

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

        try {
            // Set up request body with form data and user ID
            const requestBody = {
                name: formData.name,
                venue: formData.venue,
                venue_id: formData.venue_id,
                organizer: formData.organizer,
                date: date,
                time: start_time,
                end_time: end_time,
                description: formData.description,
                price: formData.price || 0,
                profile: formData.profile || undefined,
                cover: formData.cover || undefined,
                images: formData.images || [],
                user_id: user_id,
            };

            // Send POST request to server with request body
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/approvals`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            
            const data = await response.json();
            
            if (response.ok) {
                // If request was successful, show success message
                setSubmitSuccess(true);
                // Reset form
                setFormData({
                    name: '',
                    venue: '',
                    venue_id: '',
                    organizer: '',
                    datetime: '',
                    endtime: '',
                    price: '',
                    profile: '',
                    cover: '',
                    description: '',
                    images: [],
                });
            } else {
                // If request failed, set error message
                setError(data.msg || 'Failed to submit event for approval');
            }
        } catch (error) {
            console.error('Error submitting event:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full text-left bg-white rounded-lg shadow-lg items-center">
            <div className="p-8 w-full">
                <h1 className="text-2xl font-bold text-gray-700 mb-4">
                    Request an Event
                </h1>
                
                {submitSuccess ? (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-bold text-green-700 mb-2">Event Submitted Successfully!</h2>
                        <p className="text-green-600 mb-4">
                            Your event request has been submitted for approval. An administrator will review your request soon.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setSubmitSuccess(false);
                                    router.push('/users/dashboard');
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => setSubmitSuccess(false)}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
                            >
                                Submit Another Event
                            </button>
                        </div>
                    </div>
                ) : (
                    <form
                        id="event-form"
                        onSubmit={handleEventFormSubmit}
                        className="space-y-8"
                    >
                        {error && (
                            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        
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
                                className="block font-medium text-gray-700"
                            >
                                Event Title:
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="venue"
                                    className="block font-medium text-gray-700"
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
                                            {venue.name} ({venue.location}) - Capacity: {venue.capacity}
                                        </option>
                                    ))}
                                </select>
                                {formData.venue_id && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {venues.find(v => v.venue_id === formData.venue_id)?.description || ''}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label
                                    htmlFor="organizer"
                                    className="block font-medium text-gray-700"
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
                                    className="block font-medium text-gray-700"
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
                                    className="block font-medium text-gray-700"
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
                                    className="block font-medium text-gray-700"
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
                                <ImageUploader
                                    onImageUpload={(url) => setFormData({ ...formData, profile: url })}
                                    label="Event Profile Image"
                                    existingImageUrl={formData.profile}
                                />
                            </div>
                            
                            <div>
                                <ImageUploader
                                    onImageUpload={(url) => setFormData({ ...formData, cover: url })}
                                    label="Event Cover Image"
                                    existingImageUrl={formData.cover}
                                />
                            </div>
                            
                            <div>
                                <MultipleImageUploader
                                    onImagesUpload={(urls) => setFormData({ ...formData, images: urls })}
                                    label="Additional Event Images (for carousel)"
                                    existingImageUrls={formData.images}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label
                                htmlFor="description"
                                className="block font-medium text-gray-700"
                            >
                                Description:
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                                    loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserEventForm;
