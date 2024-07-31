import React, { useState } from 'react';

const CountryDisplay = () => {
  const countries = [
    'USA', 'Canada', 'UK', 'Germany', 'France',
    'Italy', 'Spain', 'Australia', 'India', 'China',
    'Japan', 'South Korea', 'Brazil', 'Argentina', 'Mexico',
    'South Africa', 'Nigeria', 'Egypt', 'Turkey', 'Saudi Arabia',
    'UAE', 'Iran', 'Israel', 'Thailand', 'Malaysia',
    'Singapore', 'Vietnam', 'Philippines', 'Indonesia', 'Pakistan',
    'Bangladesh', 'Sri Lanka', 'Nepal', 'Myanmar', 'Cambodia'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < countries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div>
      <h1>Country Display</h1>
      <div>
        <h2>{countries[currentIndex]}</h2>
      </div>
      <div>
        <button onClick={handlePrev} disabled={currentIndex === 0}>Previous</button>
        <button onClick={handleNext} disabled={currentIndex === countries.length - 1}>Next</button>
      </div>
    </div>
  );
};

export default CountryDisplay;
