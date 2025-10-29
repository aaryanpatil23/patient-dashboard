import React, { useState } from 'react';
import { fetchWithAuth } from '../api';
import { StarIcon } from './Icons';

function ReviewModal({ appointment, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setIsSubmitting(true);
    setError('');
    
    try {
      await fetchWithAuth('/patient/reviews', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: appointment.doctor_id,
          appointment_id: appointment.id,
          rating: rating,
          comment: comment
        })
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="card-glassmorphism p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold dark:text-slate-200 mb-2">Leave a Review</h2>
        <p className="mb-4 dark:text-slate-300">How was your appointment with {appointment.doctor_name}?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rating *</label>
            <div className="flex space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  type="button" 
                  key={star} 
                  onClick={() => setRating(star)}
                  onMouseOver={() => setRating(star)}
                >
                  <StarIcon className="w-8 h-8" filled={star <= rating} />
                </button>
              ))}
            </div>
          </div>
          
          {/* Comment Input */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comment (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows="3"
              className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Share your experience..."
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ReviewModal;