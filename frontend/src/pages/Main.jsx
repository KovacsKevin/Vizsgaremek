import React from 'react';
import Navbar from './navbar';  // Import the Navbar component
import SearchSection from './Search';

// Import the background image
import backgroundImage from './6.png';  // Adjust the path as needed

function Main() {
  return (
    <div>
      <Navbar />

      {/* Div with background image and flex layout */}
      <div
        className="relative w-full h-96 bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Semi-transparent overlay to make text and form stand out */}
        <div className="absolute inset-0 bg-black opacity-0"></div>

        {/* Content on top of the background */}
        <div className="relative z-10 text-center text-white">
          {/* Search Section */}
          <div className="flex justify-center mt-96">
            <form action="#" method="post">
              {/* Unified Container with Border Around All Elements and Background */}
              <div className="border-2 border-gray-300 rounded-lg shadow-lg p-0 w-full max-w-4xl bg-white bg-opacity-75">
                <div className="flex flex-wrap justify-between">
                  {/* Pickup City */}
                  <div className="w-full md:w-1/4 mb-0 pr-[5px]">
                    <input
                      type="text"
                      className="form-control search-slt w-full px-6 py-4 text-xl rounded-md border-none"
                      placeholder="Enter Pickup City"
                    />
                  </div>

                  {/* Drop City */}
                  <div className="w-full md:w-1/4 mb-0 pr-[5px]">
                    <input
                      type="text"
                      className="form-control search-slt w-full px-6 py-4 text-xl rounded-md border-none"
                      placeholder="Enter Drop City"
                    />
                  </div>

                  {/* Vehicle Select */}
                  <div className="w-full md:w-1/4 mb-0 pr-[5px]">
                    <select
                      className="form-control search-slt w-full px-6 py-4 text-xl rounded-md border-none"
                      id="vehicleSelect"
                    >
                      <option>Select Vehicle</option>
                      <option>Car</option>
                      <option>Bike</option>
                      <option>Truck</option>
                    </select>
                  </div>

                  {/* Search Button (no padding on the right) */}
                  <div className="w-full md:w-1/4 mb-0">
                    <button
                      type="button"
                      className="btn btn-danger wrn-btn w-full py-4 px-6 text-xl rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
