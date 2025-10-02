import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RatingSystemProps {
  targetId: string;
  targetType: 'user' | 'request' | 'offering' | 'event';
  targetName?: string;
  currentRating?: {
    average: number;
    count: number;
  };
  onRatingSubmitted?: () => void;
  showReviewForm?: boolean;
}

const StarIcon: React.FC<{ filled: boolean; className?: string; onClick?: () => void }> = ({ 
  filled, 
  className = "w-6 h-6", 
  onClick 
}) => (
  <svg 
    className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer hover:text-yellow-400 transition-colors`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
    onClick={onClick}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
    />
  </svg>
);

export const RatingSystem: React.FC<RatingSystemProps> = ({
  targetId,
  targetType,
  targetName,
  currentRating,
  onRatingSubmitted,
  showReviewForm = true
}) => {
  const { user, enhancedFirebase } = useAuth();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    if (!showReviewForm) {
      submitRating(rating, '');
    }
  };

  const submitRating = async (rating: number, reviewText: string) => {
    if (!user || rating === 0) return;

    setIsSubmitting(true);
    try {
      const response = await enhancedFirebase.addRating(
        targetId,
        targetType,
        rating,
        reviewText,
        user.id
      );

      if (response.success) {
        setSubmitted(true);
        setShowForm(false);
        onRatingSubmitted?.();
        
        // Record analytics
        await enhancedFirebase.recordAnalytics('rating_submitted', {
          targetType,
          rating,
          hasReview: reviewText.length > 0,
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (selectedRating > 0) {
      submitRating(selectedRating, review);
    }
  };

  const getTypeDisplayName = () => {
    switch (targetType) {
      case 'user': return 'Helper';
      case 'request': return 'Request';
      case 'offering': return 'Offering';
      case 'event': return 'Event';
      default: return 'Item';
    }
  };

  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please log in to rate this {getTypeDisplayName().toLowerCase()}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="text-green-700">Thank you for your rating!</p>
        {currentRating && (
          <div className="flex items-center justify-center mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon key={star} filled={star <= Math.round(currentRating.average)} />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {currentRating.average.toFixed(1)} ({currentRating.count} ratings)
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Current Rating Display */}
      {currentRating && (
        <div className="mb-4 pb-4 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Rating</h3>
          <div className="flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon key={star} filled={star <= Math.round(currentRating.average)} />
              ))}
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              {currentRating.average.toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-600">
              ({currentRating.count} {currentRating.count === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>
      )}

      {/* Rating Form */}
      {!showForm ? (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Rate this {getTypeDisplayName()}
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Rate {targetName ? `"${targetName}"` : `this ${getTypeDisplayName().toLowerCase()}`}
          </h3>
          
          {/* Star Rating */}
          <div className="mb-4">
            <div className="flex items-center justify-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  filled={star <= (hoveredRating || selectedRating)}
                  className="w-8 h-8"
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
            
            <div 
              className="text-center"
              onMouseEnter={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className="inline-block mx-1 px-2 py-1 text-sm rounded cursor-pointer hover:bg-gray-100"
                  onMouseEnter={() => setHoveredRating(star)}
                  onClick={() => handleStarClick(star)}
                >
                  {star} - {getRatingDescription(star)}
                </span>
              ))}
            </div>
            
            {selectedRating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                You selected: {selectedRating} stars - {getRatingDescription(selectedRating)}
              </p>
            )}
          </div>

          {/* Review Text (Optional) */}
          {showReviewForm && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={`Share your experience with this ${getTypeDisplayName().toLowerCase()}...`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={selectedRating === 0 || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
            
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedRating(0);
                setReview('');
                setHoveredRating(0);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Anonymous Rating Notice */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            Your rating will be submitted {targetType === 'user' ? 'with your symbolic identity' : 'anonymously'} to maintain privacy.
          </p>
        </div>
      )}
    </div>
  );
};