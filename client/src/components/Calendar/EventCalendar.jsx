import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const EventCalendar = ({ events }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    // Transform events data to calendar format
    if (events && events.length > 0) {
      console.log(`Processing ${events.length} events for calendar display`);
      console.log('Raw events data:', JSON.stringify(events));
      
      const formattedEvents = events.map((event, index) => {
        try {
          // Log detailed event information for debugging
          console.log(`Processing event ${index + 1}:`, 
            'Name:', event.name || event.title, 
            'Date:', event.date, 
            'Time:', event.time,
            'Price:', event.price,
            'ID:', event.event_id || event.id
          );
          
          // Skip events without required data
          if (!event) {
            console.warn('Null or undefined event at index', index);
            return null;
          }
          
          let startDate, endDate;
          
          // Handle different date formats or already formatted dates
          if (typeof event.start === 'object' && event.start instanceof Date) {
            // Already a Date object (from admin calendar formatting)
            console.log('Using pre-formatted date object');
            startDate = event.start;
            endDate = event.end || new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          } else if (event.date && event.time) {
            // Parse from string formats
            if (event.date.includes('/')) {
              // Format: DD/MM/YYYY or DD/MM/YY
              const dateParts = event.date.split('/');
              let year = dateParts[2];
              // Add '20' prefix if year is in YY format
              if (year && year.length === 2) {
                year = '20' + year;
              }
              
              const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS Date
              const day = parseInt(dateParts[0]);
              
              // Parse time
              const timeParts = event.time.split(':');
              const hours = parseInt(timeParts[0]);
              const minutes = parseInt(timeParts[1] || '0');
              
              console.log('Creating date from parts:', { year, month, day, hours, minutes });
              
              // Create start date
              startDate = new Date(parseInt(year), month, day, hours, minutes);
              
              // Create end date (2 hours later by default, or use end_time if available)
              if (event.end_time) {
                const endTimeParts = event.end_time.split(':');
                const endHours = parseInt(endTimeParts[0]);
                const endMinutes = parseInt(endTimeParts[1] || '0');
                
                endDate = new Date(parseInt(year), month, day, endHours, endMinutes);
              } else {
                endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 2);
              }
            } else {
              // Try to parse as ISO format or other formats
              console.warn('Trying to parse non-standard date format:', event.date);
              try {
                // Try to create a date from the string
                const dateStr = `${event.date}T${event.time}`;
                startDate = new Date(dateStr);
                
                // If invalid, fall back to current date
                if (isNaN(startDate.getTime())) {
                  console.warn('Invalid date, using current date as fallback');
                  startDate = new Date();
                }
                
                endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 2);
              } catch (dateError) {
                console.error('Error parsing date:', dateError);
                startDate = new Date();
                endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
              }
            }
          } else {
            // Fallback to current date/time if no date/time info
            console.warn('Event missing date or time, using current date:', event);
            startDate = new Date();
            endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          }
          
          // Verify the dates are valid
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Invalid date created for event:', event);
            return null;
          }
          
          // Create the formatted event object
          const formattedEvent = {
            id: event.id || event.event_id || `event-${index}`,
            title: event.title || event.name || 'Unnamed Event',
            start: startDate,
            end: endDate,
            extendedProps: {
              venue: event.venue || event.extendedProps?.venue || 'No venue',
              organizer: event.organizer || event.extendedProps?.organizer || 'Unknown organizer',
              price: event.price !== undefined ? event.price : 0
            }
          };
          
          console.log('Successfully formatted event:', formattedEvent.title, 
            'Start:', formattedEvent.start.toLocaleString(), 
            'End:', formattedEvent.end.toLocaleString());
          
          return formattedEvent;
        } catch (error) {
          console.error('Error processing event for calendar:', error, event);
          return null;
        }
      }).filter(Boolean); // Remove null entries
      
      console.log(`Successfully formatted ${formattedEvents.length} events for calendar`);
      setCalendarEvents(formattedEvents);
    } else {
      console.log('No events to display in calendar');
      setCalendarEvents([]);
    }
  }, [events]);

  const handleEventClick = (info) => {
    const event = info.event;
    const startTime = event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const endTime = event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const price = event.extendedProps.price !== undefined ? event.extendedProps.price : 0;
    
    alert(
      `Event Details:\n\n` +
      `📅 Event: ${event.title}\n` +
      `⏰ Time: ${startTime} - ${endTime}\n` +
      `📍 Venue: ${event.extendedProps.venue}\n` +
      `👤 Organizer: ${event.extendedProps.organizer}\n` +
      `💰 Price: ${price === 0 ? 'Free' : `₹${price}`}\n` +
      `\nClick OK to close`
    );
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1 overflow-hidden">
        <b>{eventInfo.timeText}</b>
        <div className="text-xs font-bold truncate">{eventInfo.event.title}</div>
        <div className="text-xs truncate">📍 {eventInfo.event.extendedProps.venue}</div>
        <div className="text-xs truncate">👤 {eventInfo.event.extendedProps.organizer}</div>
      </div>
    );
  };

  return (
    <div className="w-full p-2 sm:p-4 overflow-x-auto">
      <div className="min-w-[320px] max-w-full mx-auto" style={{ minWidth: 0 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height={window.innerWidth < 640 ? 400 : 600}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>
    </div>
  );
};

export default EventCalendar;
