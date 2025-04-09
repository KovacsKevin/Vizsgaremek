"use client"

import { useState, useEffect } from "react"

// Helper function to format dates for datetime-local inputs
const formatDateForInput = (date) => {
  return date.toISOString().slice(0, 16);
};

// Helper function to truncate date to minutes (ignore seconds and milliseconds)
const truncateToMinutes = (date) => {
  const newDate = new Date(date);
  newDate.setSeconds(0, 0);
  return newDate;
};

export function EventModal({ isOpen, onClose, modalContent, openHelyszinModal, openSportModal }) {
  const [formData, setFormData] = useState({
    helyszinId: "",
    sportId: "",
    kezdoIdo: "",
    zaroIdo: "",
    szint: "",
    minimumEletkor: "",
    maximumEletkor: "",
    maximumLetszam: "",
  })

  // Add field-specific error states
  const [fieldErrors, setFieldErrors] = useState({
    helyszinId: "",
    sportId: "",
    kezdoIdo: "",
    zaroIdo: "",
    szint: "",
    maximumLetszam: "",
    minimumEletkor: "",
    maximumEletkor: ""
  })

  // Add state for min date values
  const [minDates, setMinDates] = useState({
    kezdoIdo: formatDateForInput(truncateToMinutes(new Date())),
    zaroIdo: formatDateForInput(truncateToMinutes(new Date()))
  });

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [imageError, setImageError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [locations, setLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [sports, setSports] = useState([])
  const [loadingSports, setLoadingSports] = useState(false)

  // New state variables for searchable inputs
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [sportSearchTerm, setSportSearchTerm] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);

  // Fetch locations and sports when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLocations()
      fetchSports()

      // Reset form and errors when modal opens
      setFormData({
        helyszinId: "",
        sportId: "",
        kezdoIdo: "",
        zaroIdo: "",
        szint: "",
        minimumEletkor: "",
        maximumEletkor: "",
        maximumLetszam: "",
      })
      setFieldErrors({
        helyszinId: "",
        sportId: "",
        kezdoIdo: "",
        zaroIdo: "",
        szint: "",
        maximumLetszam: "",
        minimumEletkor: "",
        maximumEletkor: ""
      })

      // Reset min dates with current time (truncated to minutes)
      setMinDates({
        kezdoIdo: formatDateForInput(truncateToMinutes(new Date())),
        zaroIdo: formatDateForInput(truncateToMinutes(new Date()))
      });

      setImageFile(null)
      setImagePreview("")
      setErrorMessage("")
      setImageError(false)
      setSuccess(false)

      // Reset search terms
      setLocationSearchTerm("");
      setSportSearchTerm("");
    }
  }, [isOpen])

  // Effect to update search terms when locations or sports are loaded
  useEffect(() => {
    if (formData.helyszinId) {
      const selectedLocation = locations.find(loc => loc.Id.toString() === formData.helyszinId.toString());
      if (selectedLocation) {
        setLocationSearchTerm(`${selectedLocation.Telepules} - ${selectedLocation.Nev}`);
      }
    }

    if (formData.sportId) {
      const selectedSport = sports.find(sport => sport.Id.toString() === formData.sportId.toString());
      if (selectedSport) {
        setSportSearchTerm(selectedSport.Nev);
      }
    }
  }, [locations, sports, formData.helyszinId, formData.sportId]);

  // Effect to close suggestion dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLocationSuggestions(false);
      setShowSportSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchLocations = async () => {
    setLoadingLocations(true)
    setErrorMessage("")

    try {
      const token =
        localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.")
        setLoadingLocations(false)
        return
      }

      const response = await fetch("http://localhost:8081/api/v1/getOwnHelyszin", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to fetch locations")
      }

      const data = await response.json()
      setLocations(data.locations || [])
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while fetching locations")
    } finally {
      setLoadingLocations(false)
    }
  }

  const fetchSports = async () => {
    setLoadingSports(true)
    setErrorMessage("")

    try {
      const token =
        localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.")
        setLoadingSports(false)
        return
      }

      const response = await fetch("http://localhost:8081/api/v1/allSportok", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to fetch sports")
      }

      const data = await response.json()
      setSports(data.sportok || [])
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while fetching sports")
    } finally {
      setLoadingSports(false)
    }
  }

  // Functions for searchable inputs
  const handleLocationSearch = (e) => {
    setLocationSearchTerm(e.target.value);
    setShowLocationSuggestions(true);

    // Clear the selected location if the search field is emptied
    if (e.target.value === "") {
      setFormData(prev => ({
        ...prev,
        helyszinId: ""
      }));
    }
  };

  const handleSportSearch = (e) => {
    setSportSearchTerm(e.target.value);
    setShowSportSuggestions(true);

    // Clear the selected sport if the search field is emptied
    if (e.target.value === "") {
      setFormData(prev => ({
        ...prev,
        sportId: ""
      }));
    }
  };

  const selectLocation = (locationId) => {
    setFormData(prev => ({
      ...prev,
      helyszinId: locationId
    }));

    // Find the selected location to display in the input
    const selectedLocation = locations.find(loc => loc.Id.toString() === locationId.toString());
    if (selectedLocation) {
      setLocationSearchTerm(`${selectedLocation.Telepules} - ${selectedLocation.Nev}`);
    }

    setShowLocationSuggestions(false);

    // Clear any error for helyszinId field
    setFieldErrors(prev => ({
      ...prev,
      helyszinId: ""
    }));
  };

  const selectSport = (sportId) => {
    setFormData(prev => ({
      ...prev,
      sportId: sportId
    }));

    // Find the selected sport to display in the input
    const selectedSport = sports.find(sport => sport.Id.toString() === sportId.toString());
    if (selectedSport) {
      setSportSearchTerm(selectedSport.Nev);
    }

    setShowSportSuggestions(false);

    // Clear any error for sportId field
    setFieldErrors(prev => ({
      ...prev,
      sportId: ""
    }));
  };

  // Validate field when it changes
  const validateField = (name, value) => {
    let error = "";
    const now = truncateToMinutes(new Date()); // Truncate current time to minutes

    switch (name) {
      case "kezdoIdo":
        if (value) {
          const inputDate = truncateToMinutes(new Date(value));
          if (inputDate < now) {
            error = "A kezdő időpont nem lehet korábbi, mint a jelenlegi időpont.";
          }
        }
        break;
      case "zaroIdo":
        if (value && formData.kezdoIdo) {
          const startDate = truncateToMinutes(new Date(formData.kezdoIdo));
          const endDate = truncateToMinutes(new Date(value));
          if (endDate <= startDate) {
            error = "A záró időpont nem lehet korábbi vagy egyenlő, mint a kezdő időpont.";
          }
        }
        break;
      case "maximumLetszam":
        if (value && parseInt(value) < 2) {
          error = "A maximum létszám legalább 2 fő kell legyen.";
        }
        break;
      case "minimumEletkor":
        const minAge = parseInt(value);
        if (value && minAge <= 5) {
          error = "A minimum életkor nagyobb kell legyen, mint 5 év.";
        } else if (value && formData.maximumEletkor && minAge >= parseInt(formData.maximumEletkor)) {
          // Don't show error here if ages are equal, we'll show it only on maximumEletkor
          if (minAge > parseInt(formData.maximumEletkor)) {
            error = "A minimum életkor kisebb kell legyen, mint a maximum életkor.";
          }
        }
        break;
      case "maximumEletkor":
        const maxAge = parseInt(value);
        if (value && maxAge >= 100) {
          error = "A maximum életkor kisebb kell legyen, mint 100 év.";
        } else if (value && formData.minimumEletkor) {
          const minAge = parseInt(formData.minimumEletkor);
          if (maxAge <= minAge) {
            if (maxAge === minAge) {
              error = "A maximum életkor nem lehet egyenlő a minimum életkorral.";
            } else {
              error = "A maximum életkor nagyobb kell legyen, mint a minimum életkor.";
            }
          }
        }
        break;
      default:
        break;
    }

    return error;
  }

  const handleChange = (e) => {
    const { id, value } = e.target

    // Update form data
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }))

    // If start time changes, update the minimum end time
    if (id === "kezdoIdo" && value) {
      const kezdoDate = new Date(value);
      // Add at least 1 minute to the start time for the minimum end time
      kezdoDate.setMinutes(kezdoDate.getMinutes() + 1);
      setMinDates(prev => ({
        ...prev,
        zaroIdo: formatDateForInput(kezdoDate)
      }));

      // If current end time is now invalid, clear it
      if (formData.zaroIdo && new Date(formData.zaroIdo) <= new Date(value)) {
        setFormData(prev => ({
          ...prev,
          zaroIdo: ""
        }));
        // Clear any error for zaroIdo since we've reset it
        setFieldErrors(prev => ({
          ...prev,
          zaroIdo: ""
        }));
      }
    }

    // Validate the field
    const error = validateField(id, value);

    // Update field errors
    setFieldErrors(prev => ({
      ...prev,
      [id]: error
    }));

    // Also validate related fields if needed
    if (id === "kezdoIdo" && formData.zaroIdo) {
      const zaroIdoError = validateField("zaroIdo", formData.zaroIdo);
      setFieldErrors(prev => ({
        ...prev,
        zaroIdo: zaroIdoError
      }));
    }

    if (id === "minimumEletkor" && formData.maximumEletkor) {
      // Check if ages are equal
      const minAge = parseInt(value);
      const maxAge = parseInt(formData.maximumEletkor);

      if (minAge === maxAge) {
        // If ages are equal, only show error on maximum age field
        setFieldErrors(prev => ({
          ...prev,
          minimumEletkor: "",
          maximumEletkor: "A maximum életkor nem lehet egyenlő a minimum életkorral."
        }));
      } else {
        // Otherwise validate normally
        const maxAgeError = validateField("maximumEletkor", formData.maximumEletkor);
        setFieldErrors(prev => ({
          ...prev,
          maximumEletkor: maxAgeError
        }));
      }
    }

    if (id === "maximumEletkor" && formData.minimumEletkor) {
      // Check if ages are equal
      const minAge = parseInt(formData.minimumEletkor);
      const maxAge = parseInt(value);

      if (minAge === maxAge) {
        // If ages are equal, only show error on maximum age field
        setFieldErrors(prev => ({
          ...prev,
          minimumEletkor: "",
          maximumEletkor: "A maximum életkor nem lehet egyenlő a minimum életkorral."
        }));
      } else if (minAge > 5 && minAge < maxAge) {
        // If min age is valid, clear any error
        setFieldErrors(prev => ({
          ...prev,
          minimumEletkor: ""
        }));
      } else {
        // Otherwise validate normally
        const minAgeError = validateField("minimumEletkor", formData.minimumEletkor);
        setFieldErrors(prev => ({
          ...prev,
          minimumEletkor: minAgeError
        }));
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create URL for preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setImageError(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage("")
    setImageError(false)
    setSuccess(false)

    // Check if image is provided
    if (!imageFile) {
      setImageError(true)
      setSubmitting(false)
      return
    }

    // Validate all fields before submission
    let hasErrors = false;
    const newErrors = { ...fieldErrors };

    // Validate required fields
    if (!formData.helyszinId) {
      newErrors.helyszinId = "Helyszín kiválasztása kötelező";
      hasErrors = true;
    }

    if (!formData.sportId) {
      newErrors.sportId = "Sport kiválasztása kötelező";
      hasErrors = true;
    }

    if (!formData.szint) {
      newErrors.szint = "Szint kiválasztása kötelező";
      hasErrors = true;
    }

    // Validate kezdoIdo
    const kezdoIdoError = validateField("kezdoIdo", formData.kezdoIdo);
    if (kezdoIdoError) {
      newErrors.kezdoIdo = kezdoIdoError;
      hasErrors = true;
    }

    // Validate zaroIdo
    const zaroIdoError = validateField("zaroIdo", formData.zaroIdo);
    if (zaroIdoError) {
      newErrors.zaroIdo = zaroIdoError;
      hasErrors = true;
    }

    // Validate maximumLetszam
    const maxLetszamError = validateField("maximumLetszam", formData.maximumLetszam);
    if (maxLetszamError) {
      newErrors.maximumLetszam = maxLetszamError;
      hasErrors = true;
    }

    // Validate age range
    const minAgeError = validateField("minimumEletkor", formData.minimumEletkor);
    if (minAgeError) {
      newErrors.minimumEletkor = minAgeError;
      hasErrors = true;
    }

    const maxAgeError = validateField("maximumEletkor", formData.maximumEletkor);
    if (maxAgeError) {
      newErrors.maximumEletkor = maxAgeError;
      hasErrors = true;
    }

    // Check if min and max age are equal
    if (formData.minimumEletkor && formData.maximumEletkor &&
      parseInt(formData.minimumEletkor) === parseInt(formData.maximumEletkor)) {
      // Only show error on maximum age field
      newErrors.minimumEletkor = "";
      newErrors.maximumEletkor = "A maximum életkor nem lehet egyenlő a minimum életkorral.";
      hasErrors = true;
    }

    // Update error states
    setFieldErrors(newErrors);

    if (hasErrors) {
      setSubmitting(false);
      setErrorMessage("Kérjük, javítsa a hibákat a folytatás előtt.");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.")
        setSubmitting(false)
        return
      }

      // Create a FormData object to send the form data and image file
      const formDataToSend = new FormData()
      // Add all form fields to the FormData
      for (const key in formData) {
        formDataToSend.append(key, formData[key])
      }

      // Add the image file if it exists
      if (imageFile) {
        formDataToSend.append("imageFile", imageFile)
      }

      const response = await fetch("http://localhost:8081/api/v1/createEsemeny", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header when using FormData
          // It will be set automatically with the correct boundary
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create event")
      }

      const data = await response.json()
      setSuccess(true)

      // Reset form after successful submission
      setFormData({
        helyszinId: "",
        sportId: "",
        kezdoIdo: "",
        zaroIdo: "",
        szint: "",
        minimumEletkor: "",
        maximumEletkor: "",
        maximumLetszam: "",
      })
      setImageFile(null)
      setImagePreview("")
      setLocationSearchTerm("")
      setSportSearchTerm("")

      // Close modal after 2 seconds on success and refresh the page
      setTimeout(() => {
        onClose()
        setSuccess(false)
        window.location.reload() // Refresh the page to show the new event
      }, 2000)
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while creating the event")
    } finally {
      setSubmitting(false)
    }
  }

  // Handler for opening the location modal
  const handleCreateLocation = (e) => {
    e.preventDefault()
    // Open the location modal without closing the event modal
    openHelyszinModal({
      onLocationCreated: (newLocation) => {
        // Fetch locations again to update the dropdown
        fetchLocations();
        // Set the newly created location as the selected one
        setFormData(prev => ({
          ...prev,
          helyszinId: newLocation.Id.toString()
        }));
        // Update the search term with the new location
        setLocationSearchTerm(`${newLocation.Telepules} - ${newLocation.Nev}`);
        // Clear any error for helyszinId field
        setFieldErrors(prev => ({
          ...prev,
          helyszinId: ""
        }));
      }
    });
  }

  // Handler for opening the sport modal
  const handleCreateSport = (e) => {
    e.preventDefault()
    // Close the event modal temporarily
    onClose()
    // Open the sport modal
    openSportModal()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-[600px] w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-700/50 max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{
          animation: "modal-appear 0.3s ease-out forwards",
          transform: "scale(0.95)",
          opacity: 0,
        }}
      >
        <style jsx>{`
            @keyframes modal-appear {
              0% {
                transform: scale(0.95);
                opacity: 0;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            @keyframes pulse-glow {
              0% {
                box-shadow: 0 0 5px 0px rgba(147, 51, 234, 0.5);
              }
              50% {
                box-shadow: 0 0 15px 5px rgba(147, 51, 234, 0.5);
              }
              100% {
                box-shadow: 0 0 5px 0px rgba(147, 51, 234, 0.5);
              }
            }
            
            /* Hide scrollbar but keep functionality */
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            
            /* For IE, Edge and Firefox */
            .scrollbar-hide {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
          `}</style>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              {modalContent.title}
            </h2>
            <p className="text-gray-400 mt-1">{modalContent.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 rounded-full p-2 transition-all duration-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 p-4 rounded-xl mb-6 flex items-center">
            <div className="mr-3 flex-shrink-0 bg-green-500/20 rounded-full p-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p>Az esemény sikeresen létrehozva!</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 flex items-center">
            <div className="mr-3 flex-shrink-0 bg-red-500/20 rounded-full p-2">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            {/* Location selector - now with searchable input */}
            <div>
              <label htmlFor="helyszinId" className="block mb-2 text-sm font-medium text-gray-300">
                Helyszín
              </label>
              <div className="flex gap-2 relative">
                <div className="relative w-full">
                  <input
                    type="text"
                    id="locationSearch"
                    className={`bg-slate-800/80 border ${fieldErrors.helyszinId ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                    value={locationSearchTerm}
                    onChange={handleLocationSearch}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLocationSuggestions(true);
                    }}
                    placeholder="Keresés település vagy helyszín név alapján..."
                    disabled={loadingLocations}
                  />
                  {showLocationSuggestions && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto scrollbar-hide">
                      {locations.length === 0 ? (
                        <div className="p-3 text-gray-400 text-sm">Előszőr hozzon létre egy helyszínt a +-gomb segítségével!</div>
                      ) : (
                        locations
                          .filter(location =>
                            `${location.Telepules} - ${location.Nev}`.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
                            locationSearchTerm === ""
                          )
                          .slice(0, 5) // Limit to 5 suggestions
                          .map(location => (
                            <div
                              key={location.Id}
                              className="p-3 hover:bg-slate-700 cursor-pointer text-gray-200 text-sm transition-colors duration-150"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectLocation(location.Id.toString());
                              }}
                            >
                              {location.Telepules} - {location.Nev}
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCreateLocation}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm rounded-xl px-3 transition duration-300 shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 flex items-center justify-center"
                  title="Új helyszín létrehozása"
                  type="button"
                >
                  +
                </button>
              </div>
              {loadingLocations && (
                <p className="text-purple-400 text-xs mt-2 flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-purple-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Helyszínek betöltése...
                </p>
              )}
              {fieldErrors.helyszinId && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.helyszinId}</p>
              )}
            </div>

            {/* Sport selector - now with searchable input */}
            <div>
              <label htmlFor="sportId" className="block mb-2 text-sm font-medium text-gray-300">
                Sport
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sportSearch"
                  className={`bg-slate-800/80 border ${fieldErrors.sportId ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                  value={sportSearchTerm}
                  onChange={handleSportSearch}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSportSuggestions(true);
                  }}
                  placeholder="Keresés sport név alapján..."
                  disabled={loadingSports}
                />
                {showSportSuggestions && (
                  <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto scrollbar-hide">
                    {sports.length === 0 ? (
                      <div className="p-3 text-gray-400 text-sm">Nincs találat.</div>
                    ) : (
                      sports
                        .filter(sport =>
                          sport.Nev.toLowerCase().includes(sportSearchTerm.toLowerCase()) ||
                          sportSearchTerm === ""
                        )
                        .slice(0, 5) // Limit to 5 suggestions
                        .map(sport => (
                          <div
                            key={sport.Id}
                            className="p-3 hover:bg-slate-700 cursor-pointer text-gray-200 text-sm transition-colors duration-150"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectSport(sport.Id.toString());
                            }}
                          >
                            {sport.Nev}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
              {loadingSports && (
                <p className="text-purple-400 text-xs mt-2 flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-purple-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sportok betöltése...
                </p>
              )}
              {fieldErrors.sportId && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.sportId}</p>
              )}
            </div>

            <div>
              <label htmlFor="kezdoIdo" className="block mb-2 text-sm font-medium text-gray-300">
                Kezdő időpont
              </label>
              <input
                type="datetime-local"
                id="kezdoIdo"
                className={`bg-slate-800/80 border ${fieldErrors.kezdoIdo ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                value={formData.kezdoIdo}
                onChange={handleChange}
                min={minDates.kezdoIdo}
                required
              />
              {fieldErrors.kezdoIdo && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.kezdoIdo}</p>
              )}
            </div>

            <div>
              <label htmlFor="zaroIdo" className="block mb-2 text-sm font-medium text-gray-300">
                Záró időpont
              </label>
              <input
                type="datetime-local"
                id="zaroIdo"
                className={`bg-slate-800/80 border ${fieldErrors.zaroIdo ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                value={formData.zaroIdo}
                onChange={handleChange}
                min={formData.kezdoIdo ? minDates.zaroIdo : minDates.kezdoIdo}
                disabled={!formData.kezdoIdo}
                required
              />
              {!formData.kezdoIdo && (
                <p className="text-amber-500 text-xs mt-1">Először válassz kezdő időpontot</p>
              )}
              {fieldErrors.zaroIdo && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.zaroIdo}</p>
              )}
            </div>

            <div>
              <label htmlFor="maximumLetszam" className="block mb-2 text-sm font-medium text-gray-300">
                Létszám
              </label>
              <input
                type="number"
                id="maximumLetszam"
                className={`bg-slate-800/80 border ${fieldErrors.maximumLetszam ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                placeholder="Pl. 5"
                min="2"
                max="100"
                value={formData.maximumLetszam}
                onChange={handleChange}
                required
              />
              {fieldErrors.maximumLetszam && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.maximumLetszam}</p>
              )}
            </div>

            <div>
              <label htmlFor="szint" className="block mb-2 text-sm font-medium text-gray-300">
                Szint
              </label>
              <select
                id="szint"
                className={`bg-slate-800/80 border ${fieldErrors.szint ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                value={formData.szint}
                onChange={handleChange}
                required
              >
                <option value="">Válassz szintet</option>
                <option value="kezdő">Kezdő</option>
                <option value="haladó">Haladó</option>
                <option value="profi">Profi</option>
              </select>
              {fieldErrors.szint && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.szint}</p>
              )}
            </div>

            <div>
              <label htmlFor="minimumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                Minimum életkor
              </label>
              <input
                type="number"
                id="minimumEletkor"
                className={`bg-slate-800/80 border ${fieldErrors.minimumEletkor ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                placeholder="Pl. 16"
                min="6"
                max="99"
                value={formData.minimumEletkor}
                onChange={handleChange}
                required
              />
              {fieldErrors.minimumEletkor && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.minimumEletkor}</p>
              )}
            </div>

            <div>
              <label htmlFor="maximumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                Maximum életkor
              </label>
              <input
                type="number"
                id="maximumEletkor"
                className={`bg-slate-800/80 border ${fieldErrors.maximumEletkor ? "border-red-500" : "border-slate-600/50 hover:border-purple-500/50"} text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300`}
                placeholder="Pl. 99"
                min={formData.minimumEletkor ? parseInt(formData.minimumEletkor) + 1 : 7}
                max="99"
                value={formData.maximumEletkor}
                onChange={handleChange}
                required
              />
              {fieldErrors.maximumEletkor && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.maximumEletkor}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label htmlFor="imageFile" className="block mb-2 text-sm font-medium text-gray-300">
                Kép feltöltése <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="imageFile"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="imageFile"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${imageError ? "border-red-500/70" : "border-slate-600/50 hover:border-purple-500/50"
                    } rounded-xl cursor-pointer ${imageError ? "bg-red-500/10" : "bg-slate-800/50 hover:bg-slate-700/50"
                    } transition-all duration-300`}
                >
                  {imagePreview ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className={`w-8 h-8 mb-3 ${imageError ? "text-red-400" : "text-gray-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p className={`mb-2 text-sm ${imageError ? "text-red-400" : "text-gray-400"}`}>
                        <span className="font-semibold">Kattints a feltöltéshez</span> vagy húzd ide a fájlt
                      </p>
                      <p className={`text-xs ${imageError ? "text-red-500/70" : "text-gray-500"}`}>
                        SVG, PNG, JPG vagy GIF (MAX. 2MB)
                      </p>
                    </div>
                  )}
                </label>
                {imageError && (
                  <p className="text-red-500 text-xs mt-1">Kérem töltsön fel képet</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`text-white font-medium rounded-xl text-sm px-6 py-3.5 text-center transition duration-300 shadow-lg ${submitting
              ? "bg-purple-700/50 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-700/20 hover:shadow-purple-700/40"
              }`}
            disabled={submitting}
            style={{
              animation: submitting ? "none" : "pulse-glow 2s infinite",
            }}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Feldolgozás...
              </div>
            ) : (
              "Esemény létrehozása"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EventModal



