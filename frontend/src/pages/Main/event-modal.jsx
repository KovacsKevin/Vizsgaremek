import React, { useState } from "react";

export function EventModal({ isOpen, onClose, modalContent, locations = [], openHelyszinModal }) {
  const [formData, setFormData] = useState({
    helyszinId: "",
    sportId: "",
    kezdoIdo: "",
    zaroIdo: "",
    szint: "",
    minimumEletkor: "",
    maximumEletkor: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.");
        setSubmitting(false);
        return;
      }

      // Create a FormData object to send the form data and image file
      const formDataToSend = new FormData();
      // Add all form fields to the FormData
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      
      // Add the image file if it exists
      if (imageFile) {
        formDataToSend.append("imageFile", imageFile);
      }

      const response = await fetch("http://localhost:8081/api/v1/createEsemeny", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // Don't set Content-Type header when using FormData
          // It will be set automatically with the correct boundary
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create event");
      }

      const data = await response.json();
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        helyszinId: "",
        sportId: "",
        kezdoIdo: "",
        zaroIdo: "",
        szint: "",
        minimumEletkor: "",
        maximumEletkor: ""
      });
      setImageFile(null);
      setImagePreview("");

      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (error) {
      setErrorMessage(error.message || "An error occurred while creating the event");
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for opening the location modal
  const handleCreateLocation = (e) => {
    e.preventDefault();
    // Close the event modal temporarily
    onClose();
    // Open the location modal
    openHelyszinModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-[600px] w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-100">{modalContent.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-100">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p className="text-gray-400 mb-6">{modalContent.description}</p>

        {/* Success message */}
        {success && (
          <div className="bg-green-800 text-green-100 p-3 rounded mb-4">
            Az esemény sikeresen létrehozva!
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-800 text-red-100 p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            {/* Location selector - replacing the helyszinId input field */}
            <div>
              <label htmlFor="helyszinId" className="block mb-2 text-sm font-medium text-gray-300">
                Helyszín
              </label>
              <div className="flex gap-2">
                <select
                  id="helyszinId"
                  className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                  value={formData.helyszinId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Válassz helyszínt</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.Nev} - {location.Telepules}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateLocation}
                  className="bg-zinc-600 hover:bg-zinc-500 text-white text-sm rounded-lg px-3 transition duration-300"
                  title="Új helyszín létrehozása"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="sportId" className="block mb-2 text-sm font-medium text-gray-300">
                Sport
              </label>
              <input
                type="text"
                id="sportId"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                placeholder="Sport azonosító"
                value={formData.sportId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="kezdoIdo" className="block mb-2 text-sm font-medium text-gray-300">
                Kezdő időpont
              </label>
              <input
                type="datetime-local"
                id="kezdoIdo"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                value={formData.kezdoIdo}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="zaroIdo" className="block mb-2 text-sm font-medium text-gray-300">
                Záró időpont
              </label>
              <input
                type="datetime-local"
                id="zaroIdo"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                value={formData.zaroIdo}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="szint" className="block mb-2 text-sm font-medium text-gray-300">
                Szint
              </label>
              <select
                id="szint"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                value={formData.szint}
                onChange={handleChange}
                required
              >
                <option value="">Válassz szintet</option>
                <option value="kezdő">Kezdő</option>
                <option value="haladó">Haladó</option>
                <option value="profi">Profi</option>
              </select>
            </div>
            <div>
              <label htmlFor="minimumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                Minimum életkor
              </label>
              <input
                type="number"
                id="minimumEletkor"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                placeholder="Pl. 16"
                min="1"
                max="100"
                value={formData.minimumEletkor}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="maximumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                Maximum életkor
              </label>
              <input
                type="number"
                id="maximumEletkor"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                placeholder="Pl. 99"
                min="1"
                max="100"
                value={formData.maximumEletkor}
                onChange={handleChange}
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="imageFile" className="block mb-2 text-sm font-medium text-gray-300">
                Kép
              </label>
              <input
                type="file"
                id="imageFile"
                className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="text-gray-100 bg-zinc-700 hover:bg-zinc-600 focus:ring-4 focus:outline-none focus:ring-zinc-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? "Feldolgozás..." : "Esemény létrehozása"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EventModal;