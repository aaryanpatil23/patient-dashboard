import React from 'react';
import { StarIcon } from './Icons';

// A simple component to display a 5-star rating
function StarRating({ rating }) {
  const totalStars = 5;
  const fullStars = Math.round(rating);
  
  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => (
        <StarIcon key={index} filled={index < fullStars} />
      ))}
    </div>
  );
}
export default StarRating;