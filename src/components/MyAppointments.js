import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../api';
import Loader from './Loader';
import ReviewModal from './ReviewModal'; // <-- We will create this

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedApptForReview, setSelectedApptForReview] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/patient/my-appointments');
      setAppointments(data);
    } catch (err) {
      setError(err.message || "Could not load appointments.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await fetchWithAuth(`/patient/appointments/${apptId}/cancel`, { method: 'PUT' });
      fetchAppointments(); // Refresh the list
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const upcoming = appointments.filter(a => new Date(a.slot) > new Date() && a.status === 'scheduled');
  const past = appointments.filter(a => new Date(a.slot) <= new Date());

  if (loading) return <Loader />;

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Appointments</h1>
        {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">Error: {error}</div>}

        {/* Upcoming Appointments */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Upcoming</h2>
          <div className="space-y-4">
            {upcoming.length > 0 ? upcoming.map(appt => (
              <AppointmentCard key={appt.id} appt={appt} onCancel={handleCancel} />
            )) : <p className="text-slate-500 dark:text-slate-400">No upcoming appointments.</p>}
          </div>
        </section>

        {/* Past Appointments */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Past & Completed</h2>
          <div className="space-y-4">
            {past.length > 0 ? past.map(appt => (
              <AppointmentCard key={appt.id} appt={appt} onReview={setSelectedApptForReview} />
            )) : <p className="text-slate-500 dark:text-slate-400">No past appointments.</p>}
          </div>
        </section>
      </div>

      {/* The Review Modal */}
      {selectedApptForReview && (
        <ReviewModal 
          appointment={selectedApptForReview}
          onClose={() => setSelectedApptForReview(null)}
          onSuccess={() => {
            setSelectedApptForReview(null);
            fetchAppointments(); // Refresh to hide the "Leave Review" button
          }}
        />
      )}
    </>
  );
}

// Sub-component for displaying a single appointment card
const AppointmentCard = ({ appt, onCancel, onReview }) => {
  const isPast = new Date(appt.slot) <= new Date();
  const isCompleted = appt.status === 'completed';
  const isCancelled = appt.status === 'cancelled';

  return (
    <div className="p-4 card-glassmorphism rounded-lg shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{appt.doctor_name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {new Date(appt.slot).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
        </p>
        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
          isCancelled ? 'bg-red-100 text-red-700' :
          isCompleted ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>{appt.status}</span>
      </div>
      <div>
        {!isPast && !isCancelled && onCancel && (
          <button onClick={() => onCancel(appt.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200">
            Cancel
          </button>
        )}
        {isCompleted && onReview && (
          <button onClick={() => onReview(appt)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm font-medium hover:bg-yellow-200">
            Leave Review
          </button>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;