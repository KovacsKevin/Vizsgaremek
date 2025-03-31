"use client"

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
    Berles: false, // Default to false (No)
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formErrors, setFormErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const handleBooleanSelect = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
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
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get the auth token
      const token =
        localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

      if (!token) {
        setError("Nincs bejelentkezve! Kérjük, jelentkezzen be újra.")
        setIsSubmitting(false)
        return
      }

      // Prepare data to send
      const dataToSend = {
        ...formData,
        Fedett: Boolean(formData.Fedett),
        Oltozo: Boolean(formData.Oltozo),
        Berles: Boolean(formData.Berles),
        Iranyitoszam: formData.Iranyitoszam.toString(),
        // Ensure Leiras is at least an empty string
        Leiras: formData.Leiras || "",
      }

      console.log("Sending request to:", "http://localhost:8081/api/v1/createHelyszin")
      console.log("With data:", dataToSend)
      console.log("Using token:", token.substring(0, 10) + "...")

      // Submit the form data to create a new location
      const response = await fetch("http://localhost:8081/api/v1/createHelyszin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      })

      console.log("Response status:", response.status)

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        setError(`Hiba történt: ${response.status} - ${response.statusText}`)
        setIsSubmitting(false)
        return
      }

      // Try to parse the response as JSON
      let data
      try {
        const responseText = await response.text()
        console.log("Raw response:", responseText)
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        setError("A szerver válasza nem értelmezhető")
        setIsSubmitting(false)
        return
      }

      // Success handling
      setSuccess("Helyszín sikeresen létrehozva!")

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
        Berles: false,
      })

      // If an onSuccess callback was provided, call it with the new location data
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(data.helyszin)
      }

      // Close the modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error creating location:", error)
      setError("Hiba történt a szerver kommunikáció során: " + error.message)
    }

    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-700/50"
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
        `}</style>

        <div className="p-6">
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

          {error && (
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
              <p>{error}</p>
            </div>
          )}

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
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Helyszín neve */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Helyszín neve*</label>
                <input
                  type="text"
                  name="Nev"
                  value={formData.Nev}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/80 border ${formErrors.Nev ? "border-red-500" : "border-slate-600/50"} rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-purple-500/30`}
                  placeholder="Pl. Városi Sportcsarnok"
                />
                {formErrors.Nev && <p className="text-red-400 text-xs mt-1">{formErrors.Nev}</p>}
              </div>

              {/* Cím */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cím*</label>
                <input
                  type="text"
                  name="Cim"
                  value={formData.Cim}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/80 border ${formErrors.Cim ? "border-red-500" : "border-slate-600/50"} rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-purple-500/30`}
                  placeholder="Pl. Árpád út 10."
                />
                {formErrors.Cim && <p className="text-red-400 text-xs mt-1">{formErrors.Cim}</p>}
              </div>

              {/* Település */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Település*</label>
                <input
                  type="text"
                  name="Telepules"
                  value={formData.Telepules}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/80 border ${formErrors.Telepules ? "border-red-500" : "border-slate-600/50"} rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-purple-500/30`}
                  placeholder="Pl. Budapest"
                />
                {formErrors.Telepules && <p className="text-red-400 text-xs mt-1">{formErrors.Telepules}</p>}
              </div>

              {/* Irányítószám */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Irányítószám*</label>
                <input
                  type="text"
                  name="Iranyitoszam"
                  value={formData.Iranyitoszam}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/80 border ${formErrors.Iranyitoszam ? "border-red-500" : "border-slate-600/50"} rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-purple-500/30`}
                  placeholder="Pl. 1051"
                  inputMode="numeric"
                />
                {formErrors.Iranyitoszam && <p className="text-red-400 text-xs mt-1">{formErrors.Iranyitoszam}</p>}
              </div>

              {/* Fedett - X és pipa egymás mellett */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fedett helyszín</label>
                <div className="flex items-center space-x-4">
                  <div
                    onClick={() => handleBooleanSelect("Fedett", false)}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.Fedett === false
                        ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-gray-400 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.Fedett === false ? "bg-red-500" : "bg-slate-700"
                      }`}
                    >
                      {formData.Fedett === false && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      )}
                    </span>
                    Nem
                  </div>
                  <div
                    onClick={() => handleBooleanSelect("Fedett", true)}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.Fedett === true
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-gray-400 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.Fedett === true ? "bg-white" : "bg-slate-700"
                      }`}
                    >
                      {formData.Fedett === true && (
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </span>
                    Igen
                  </div>
                </div>
              </div>

              {/* Öltöző - X és pipa egymás mellett */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Öltöző elérhető</label>
                <div className="flex items-center space-x-4">
                  <div
                    onClick={() => handleBooleanSelect("Oltozo", false)}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.Oltozo === false
                        ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-gray-400 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.Oltozo === false ? "bg-red-500" : "bg-slate-700"
                      }`}
                    >
                      {formData.Oltozo === false && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      )}
                    </span>
                    Nem
                  </div>
                  <div
                    onClick={() => handleBooleanSelect("Oltozo", true)}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.Oltozo === true
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-gray-400 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.Oltozo === true ? "bg-white" : "bg-slate-700"
                      }`}
                    >
                      {formData.Oltozo === true && (
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </span>
                    Igen
                  </div>
                </div>
              </div>

              {/* Parkolás */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Parkolási lehetőség*</label>
                <select
                  name="Parkolas"
                  value={formData.Parkolas}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/80 border ${formErrors.Parkolas ? "border-red-500" : "border-slate-600/50"} rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-purple-500/30`}
                >
                  <option value="">Válasszon...</option>
                  <option value="ingyenes">Ingyenes</option>
                  <option value="fizetős">Fizetős</option>
                  <option value="nincs">Nincs</option>
                </select>
                {formErrors.Parkolas && <p className="text-red-400 text-xs mt-1">{formErrors.Parkolas}</p>}
              </div>

              {/* Leírás - optional */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leírás (opcionális)</label>
                <textarea
                  name="Leiras"
                  value={formData.Leiras}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-purple-500/30"
                  placeholder="Részletes leírás a helyszínről..."
                ></textarea>
              </div>

              {/* Bérlés - X és pipa egymás mellett */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bérlési lehetőség</label>
                <div className="flex items-center space-x-4">
                  <div
                    onClick={() => handleBooleanSelect("Berles", false)}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.Berles === false
                        ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-gray-400 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.Berles === false ? "bg-red-500" : "bg-slate-700"
                      }`}
                    >
                      {formData.Berles === false && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      )}
                    </span>
                    Nem
                  </div>
                  <div
                    onClick={() => handleBooleanSelect("Berles", true)}
                    className={`cursor-pointer px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.Berles === true
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                        : "bg-slate-800/50 text-gray-400 border border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                        formData.Berles === true ? "bg-white" : "bg-slate-700"
                      }`}
                    >
                      {formData.Berles === true && (
                        <svg
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </span>
                    Igen
                  </div>
                </div>
              </div>

              {/* Submit gomb */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 ${
                    isSubmitting
                      ? "bg-purple-700/50 text-white/70 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40"
                  }`}
                  style={{
                    animation: isSubmitting ? "none" : "pulse-glow 2s infinite",
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Feldolgozás...
                    </div>
                  ) : (
                    "Helyszín létrehozása"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

