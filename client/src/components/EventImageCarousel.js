import React, { useState } from 'react';
import Image from 'next/image';

const EventImageCarousel = ({ images = [], coverImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine cover image with additional images
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)] 
    : images;
  
  // If no images, return null
  if (!allImages.length) return null;

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? allImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === allImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      {/* Main image */}
      <div className="relative w-full h-full">
        <Image
          src={allImages[currentIndex]}
          alt={`Event image ${currentIndex + 1}`}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-lg"
        />
      </div>
      
      {/* Left/Right Arrows */}
      {allImages.length > 1 && (
        <>
          <div 
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer"
            onClick={goToPrevious}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div 
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full cursor-pointer"
            onClick={goToNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}
      
      {/* Dots navigation */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {allImages.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                slideIndex === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventImageCarousel;
