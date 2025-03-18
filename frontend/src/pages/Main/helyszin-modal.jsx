import { useState } from "react"

export function HelyszinModal({ isOpen, onClose, modalContent, onSuccess }) {
  const [formData, setFormData] = useState({
    Nev: "",
    Cim: "",
    Telepules: "",
    Iranyitoszam: "",
    Fedett: false, // Default to false (No)
    Oltozo: false, // Default to false (No)
    Parkolas: "",
    Leiras: "",
    Berles: false  // Default to false (No)
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formErrors, setFormErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      })
    }
  }

  const handleBooleanSelect = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.Nev.trim()) errors.Nev = "Helyszín neve kötelező"
    if (!formData.Cim.trim()) errors.Cim = "Cím kötelező"
    if (!formData.Telepules.trim()) errors.Telepules = "Település kötelező"
    if (!formData.Iranyitoszam.trim()) errors.Iranyitoszam = "Irányítószám kötelező"
    if (!formData.Parkolas) errors.Parkolas = "Parkolási lehetőség kötelező"
    
    // Validate irányítószám is numeric
    if (formData.Iranyitoszam && !/^\d+$/.test(formData.Iranyitoszam)) {
      errors.Iranyitoszam = "Az irányítószám csak számokat tartalmazhat"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get the auth token
      const token = localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
      
      if (!token) {
        setError("Nincs bejelentkezve! Kérjük, jelentkezzen be újra.");
        setIsSubmitting(false);
        return;
      }

      // Prepare data to send
      const dataToSend = {
        ...formData,
        Fedett: Boolean(formData.Fedett),
        Oltozo: Boolean(formData.Oltozo),
        Berles: Boolean(formData.Berles),
        Iranyitoszam: formData.Iranyitoszam.toString(),
        // Ensure Leiras is at least an empty string
        Leiras: formData.Leiras || ""
      };

      console.log("Sending request to:", "http://localhost:8081/api/v1/createHelyszin");
      console.log("With data:", dataToSend);
      console.log("Using token:", token.substring(0, 10) + "...");

      // Submit the form data to create a new location
      const response = await fetch("http://localhost:8081/api/v1/createHelyszin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log("Response status:", response.status);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        setError(`Hiba történt: ${response.status} - ${response.statusText}`);
        setIsSubmitting(false);
        return;
      }
      
      // Try to parse the response as JSON
      let data;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        setError("A szerver válasza nem értelmezhető");
        setIsSubmitting(false);
        return;
      }

      // Success handling
      setSuccess("Helyszín sikeresen létrehozva!");
      
      // Reset form
      setFormData({
        Nev: "",
        Cim: "",
        Telepules: "",
        Iranyitoszam: "",
        Fedett: false,
        Oltozo: false,
        Parkolas: "",
        Leiras: "",
        Berles: false
      });
      
      // If an onSuccess callback was provided, call it with the new location data
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(data.helyszin);
      }
      
      // Close the modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error("Error creating location:", error);
      setError("Hiba történt a szerver kommunikáció során: " + error.message);
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">{modalContent.title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-100"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-400 mb-4">{modalContent.description}</p>
          
          {error && (
            <div className="bg-red-500 bg-opacity-20 text-red-100 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500 bg-opacity-20 text-green-100 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Helyszín neve */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Helyszín neve*
                </label>
                <input
                  type="text"
                  name="Nev"
                  value={formData.Nev}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border ${formErrors.Nev ? 'border-red-500' : 'border-slate-600'} rounded py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500`}
                  placeholder="Pl. Városi Sportcsarnok"
                />
                {formErrors.Nev && <p className="text-red-500 text-xs mt-1">{formErrors.Nev}</p>}
              </div>

              {/* Cím */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cím*
                </label>
                <input
                  type="text"
                  name="Cim"
                  value={formData.Cim}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border ${formErrors.Cim ? 'border-red-500' : 'border-slate-600'} rounded py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500`}
                  placeholder="Pl. Árpád út 10."
                />
                {formErrors.Cim && <p className="text-red-500 text-xs mt-1">{formErrors.Cim}</p>}
              </div>

              {/* Település */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Település*
                </label>
                <input
                  type="text"
                  name="Telepules"
                  value={formData.Telepules}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border ${formErrors.Telepules ? 'border-red-500' : 'border-slate-600'} rounded py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500`}
                  placeholder="Pl. Budapest"
                />
                {formErrors.Telepules && <p className="text-red-500 text-xs mt-1">{formErrors.Telepules}</p>}
              </div>

              {/* Irányítószám */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Irányítószám*
                </label>
                <input
                  type="text"
                  name="Iranyitoszam"
                  value={formData.Iranyitoszam}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border ${formErrors.Iranyitoszam ? 'border-red-500' : 'border-slate-600'} rounded py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500`}
                  placeholder="Pl. 1051"
                  inputMode="numeric"
                />
                {formErrors.Iranyitoszam && <p className="text-red-500 text-xs mt-1">{formErrors.Iranyitoszam}</p>}
              </div>

              {/* Fedett - X és pipa egymás mellett */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fedett helyszín
                </label>
                <div className="flex items-center space-x-4">
                  <div 
                    onClick={() => handleBooleanSelect("Fedett", false)}
                    className={`cursor-pointer px-3 py-1 rounded ${formData.Fedett === false ? 'bg-slate-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                  >
                    ✕ Nem
                  </div>
                  <div 
                    onClick={() => handleBooleanSelect("Fedett", true)}
                    className={`cursor-pointer px-3 py-1 rounded ${formData.Fedett === true ? 'bg-slate-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                  >
                    ✓ Igen
                  </div>
                </div>
              </div>

              {/* Öltöző - X és pipa egymás mellett */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Öltöző elérhető
                </label>
                <div className="flex items-center space-x-4">
                  <div 
                    onClick={() => handleBooleanSelect("Oltozo", false)}
                    className={`cursor-pointer px-3 py-1 rounded ${formData.Oltozo === false ? 'bg-slate-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                  >
                    ✕ Nem
                  </div>
                  <div 
                    onClick={() => handleBooleanSelect("Oltozo", true)}
                    className={`cursor-pointer px-3 py-1 rounded ${formData.Oltozo === true ? 'bg-slate-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                  >
                    ✓ Igen
                  </div>
                </div>
              </div>

              {/* Parkolás */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Parkolási lehetőség*
                </label>
                <select
                  name="Parkolas"
                  value={formData.Parkolas}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border ${formErrors.Parkolas ? 'border-red-500' : 'border-slate-600'} rounded py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Válasszon...</option>
                  <option value="Ingyenes">Ingyenes</option>
                  <option value="Fizetős">Fizetős</option>
                  <option value="Nincs">Nincs</option>
                </select>
                {formErrors.Parkolas && <p className="text-red-500 text-xs mt-1">{formErrors.Parkolas}</p>}
              </div>

              {/* Leírás - optional */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Leírás (opcionális)
                </label>
                <textarea
                  name="Leiras"
                  value={formData.Leiras}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-slate-700 border border-slate-600 rounded py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500"
                  placeholder="Részletes leírás a helyszínről..."
                ></textarea>
              </div>

              {/* Bérlés - X és pipa egymás mellett */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bérlési lehetőség
                </label>
                <div className="flex items-center space-x-4">
                  <div 
                    onClick={() => handleBooleanSelect("Berles", false)}
                    className={`cursor-pointer px-3 py-1 rounded ${formData.Berles === false ? 'bg-slate-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                  >
                    ✕ Nem
                  </div>
                  <div 
                    onClick={() => handleBooleanSelect("Berles", true)}
                    className={`cursor-pointer px-3 py-1 rounded ${formData.Berles === true ? 'bg-slate-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                  >
                    ✓ Igen
                  </div>
                </div>
              </div>

              {/* Submit gomb */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Feldolgozás...
                    </div>
                  ) : "Helyszín létrehozása"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
