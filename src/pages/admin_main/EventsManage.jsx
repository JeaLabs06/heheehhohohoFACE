// src/pages/admin_main/EventsManage.jsx
import React, { useState, useEffect } from 'react';
import { FIRESTORE_DB } from '../../firebaseutil/firebase_main';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './generalstyles.css';

const EventsManage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuerySnapshot = await getDocs(collection(FIRESTORE_DB, 'events'));
        const eventsData = eventsQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle event deletion
  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(FIRESTORE_DB, 'events', eventId));
        setEvents(events.filter(event => event.id !== eventId));
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  // Filtered events based on search term
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-manage">
      <h2>Manage Events</h2>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by event name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {/* Button to navigate to Create Event */}
      <button className="create-event-button">
        <Link to="/admin/events-registration" style={{ textDecoration: 'none', color: 'white' }}>Create Event</Link>
      </button>
      {loading ? (
        <p>Loading events...</p>
      ) : (
        <table className="events-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Venue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{event.description}</td>
                <td>{new Date(event.startDate).toLocaleString()}</td>
                <td>{new Date(event.endDate).toLocaleString()}</td>
                <td>{event.venue}</td>
                <td>
                  <button onClick={() => handleDelete(event.id)}>Delete</button>
                  {/* Add edit functionality as needed */}
                  {/* <button onClick={() => handleEdit(event.id)}>Edit</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EventsManage;
