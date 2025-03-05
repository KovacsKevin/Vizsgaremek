// src/pages/Main.js
import React from 'react';
import Navbar from './navbar';  // Import the Navbar component
import SearchSection from './Search';

// Import the background image
import backgroundImage from './background.jpg';  // Adjust the path as needed

function Main() {
  return (
    <div>
      <Navbar />

      {/* Div with background image and flex layout */}
      <div
        className="w-full h-80 bg-cover bg-center flex items-center justify-between p-6"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Text on the left */}
        <h1 className="text-white text-3xl font-semibold">
          Your Text Here <br />
          Your Text Here
        </h1>
      </div>
        <SearchSection />
    </div>
  );
}

export default Main;
