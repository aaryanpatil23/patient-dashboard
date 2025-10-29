import React, { useState, useEffect } from 'react';
import { API_URL, fetchWithAuth } from '../api';
import useDebounce from '../hooks/useDebounce';
import { SearchIcon, StarIcon } from './Icons';
import Loader from './Loader';

// A small, reusable component to show star ratings
const StarRating = ({ rating }) => {
  const totalStars = 5;
  // Round the rating to the nearest whole number for display
  const fullStars = Math.round(rating);
  
  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => (
        <StarIcon key={index} filled={index < fullStars} />
      ))}
    </div>
  );
};


// This is the main component for finding and booking a doctor
function DoctorSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); // Set loading to true on initial load
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // This will now run on the initial load (with an empty query)
    // and on every change to the debouncedQuery.
    const search = async () => {
      setLoading(true);
      try {
        // This is a public endpoint, so we use standard fetch
        const response = await fetch(`${API_URL}/doctors/search?q=${debouncedQuery}`);
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    
    search();
  }, [debouncedQuery]); // Re-runs when the debounced query changes

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Book an Appointment</h1>
      <div className="relative w-full max-w-lg">
        <input 
          type="text" 
          placeholder="Search by doctor name or specialty..."
          className="w-full p-3 pl-10 border rounded-full dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        {loading && <Loader />}
        {!loading && results.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">
            {query ? "No doctors found matching your search." : "No doctors found."}
          </p>
        )}
        {results.map(doctor => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}

// Sub-component for displaying a single doctor
const DoctorCard = ({ doctor }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState('');

  const handleBooking = async () => {
    if (!selectedSlot) {
      setMessage('Please select a time slot.');
      return;
    }
    setMessage('Booking...');
    try {
      // This is a protected action, so we use fetchWithAuth
      await fetchWithAuth('/patient/book-appointment', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: doctor.id,
          slot: selectedSlot,
        })
      });
      setMessage('Appointment Booked Successfully! View it in "My Appointments".');
      setSelectedSlot(null); // Reset
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 card-glassmorphism rounded-xl shadow-md space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{doctor.name}</h2>
        <p className="text-indigo-600 dark:text-indigo-400 font-medium">{doctor.specialty} • {doctor.experience} years exp.</p>
        
        {/* Star Rating Display */}
        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={doctor.average_rating} />
          <span className="text-sm text-slate-500 dark:text-slate-400">({doctor.review_count} reviews)</span>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{doctor.clinic_name}</p>
        <p className="text-slate-600 dark:text-slate-300 mt-2">{doctor.bio}</p>
      </div>
      <div>
        <h3 className="font-semibold dark:text-white mb-2">Available Slots:</h3>
        <div className="flex flex-wrap gap-3">
          {/* --- FIX: Display slots dynamically based on API data --- */}
          {doctor.available_slots && doctor.available_slots.length > 0 ? doctor.available_slots.map(slot => (
            <button 
              key={slot} 
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedSlot === slot 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-700'
              }`}
            >
              {new Date(slot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </button>
          )) : <p className="text-sm text-slate-400 dark:text-slate-500">No available slots.</p>}
        </div>
        
        {selectedSlot && (
          <div className="mt-4">
            <button onClick={handleBooking} className="px-4 py-2 bg-green-600 text-white rounded-md font-medium">
              Confirm Booking for {new Date(selectedSlot).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </button>
            {message && <p className="text-sm text-indigo-600 mt-2">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;
