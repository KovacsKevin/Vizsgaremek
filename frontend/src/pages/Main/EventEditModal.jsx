import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getCookie } from "../sport-event-details-modal";

const EventEditModal = ({ isOpen, onClose, event, onSuccess }) => {
    const safeEvent = event || {};

    
    const formatImageUrl = (url) => {
        if (!url) return "";
        
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
            return url;
        }
        
        return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
    };
    const [formData, setFormData] = useState({
        helyszinId: safeEvent.helyszinId || safeEvent.Helyszin?.Id || "",
        sportId: safeEvent.sportId || safeEvent.Sportok?.Id || "",
        sportSearch: safeEvent.Sportok?.Nev || "", 
        kezdoIdo: safeEvent.kezdoIdo ? new Date(safeEvent.kezdoIdo).toISOString().slice(0, 16) : "",
        zaroIdo: safeEvent.zaroIdo ? new Date(safeEvent.zaroIdo).toISOString().slice(0, 16) : "",
        szint: safeEvent.szint || "",
        minimumEletkor: safeEvent.minimumEletkor || "",
        maximumEletkor: safeEvent.maximumEletkor || "",
        maximumLetszam: safeEvent.maximumLetszam || "",
        leiras: safeEvent.leiras || "",
        helyszinNev: safeEvent.Helyszin?.Nev || "",
        helyszinCim: safeEvent.Helyszin?.Cim || "",
        helyszinTelepules: safeEvent.Helyszin?.Telepules || "",
        helyszinIranyitoszam: safeEvent.Helyszin?.Iranyitoszam || "",
        helyszinFedett: Boolean(safeEvent.Helyszin?.Fedett) || false,
        helyszinOltozo: Boolean(safeEvent.Helyszin?.Oltozo) || false,
        helyszinParkolas: safeEvent.Helyszin?.Parkolas || "nincs",
        helyszinBerles: Boolean(safeEvent.Helyszin?.Berles) || false,
        helyszinLeiras: safeEvent.Helyszin?.Leiras || "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(formatImageUrl(safeEvent.imageUrl) || "");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [sports, setSports] = useState([]);
    const [loadingSports, setLoadingSports] = useState(false);
    const [editingLocation, setEditingLocation] = useState(false);
    const [showSportDropdown, setShowSportDropdown] = useState(false);
    const parkolasOptions = [
        { value: "ingyenes", label: "Ingyenes" },
        { value: "fizetős", label: "Fizetős" },
        { value: "nincs", label: "Nincs" }
    ];
    useEffect(() => {
        if (isOpen) {
            fetchLocations();
            fetchSports().then(() => {
                
                if (formData.sportId && sports.length > 0) {
                    const selectedSport = sports.find(sport => sport.Id.toString() === formData.sportId.toString());
                    if (selectedSport) {
                        setFormData(prev => ({ ...prev, sportSearch: selectedSport.Nev }));
                    }
                }
            });
        }
    }, [isOpen]);

    
    const filteredSports = sports
        .filter(sport =>
            sport.Nev.toLowerCase().includes((formData.sportSearch || "").toLowerCase()))
        .slice(0, 5);

    const fetchLocations = async () => {
        setLoadingLocations(true);
        setErrorMessage("");
        try {
            const token = getCookie('token');
            if (!token) {
                setErrorMessage("Authentication token is missing. Please login again.");
                setLoadingLocations(false);
                return;
            }
            const response = await fetch("http://localhost:8081/api/v1/getOwnHelyszin", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to fetch locations");
            }
            const data = await response.json();
            setLocations(data.locations || []);
        } catch (error) {
            setErrorMessage(error.message || "An error occurred while fetching locations");
        } finally {
            setLoadingLocations(false);
        }
    };
    const fetchSports = async () => {
        setLoadingSports(true);
        setErrorMessage("");
        try {
            const token = getCookie('token');
            if (!token) {
                setErrorMessage("Authentication token is missing. Please login again.");
                setLoadingSports(false);
                return;
            }
            const response = await fetch("http://localhost:8081/api/v1/allSportok", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to fetch sports");
            }
            const data = await response.json();
            setSports(data.sportok || []);
        } catch (error) {
            setErrorMessage(error.message || "An error occurred while fetching sports");
        } finally {
            setLoadingSports(false);
        }
    };
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData((prevState) => ({
            ...prevState,
            [id]: newValue,
        }));
    };

    const handleSportSearchChange = (e) => {
        const searchTerm = e.target.value;
        setFormData(prev => ({ ...prev, sportSearch: searchTerm }));
        setShowSportDropdown(true);

        
        if (!searchTerm) {
            setFormData(prev => ({ ...prev, sportId: "" }));
        }
    };

    const handleSportSelect = (sport) => {
        setFormData(prev => ({
            ...prev,
            sportId: sport.Id.toString(),
            sportSearch: sport.Nev
        }));
        setShowSportDropdown(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
           
        }
    };
    const startLocationEditing = () => {
        setEditingLocation(true);
    };
    const cancelLocationEditing = () => {
        setEditingLocation(false);
    };
    const saveLocation = async () => {
        try {
            const token = getCookie('token');
            if (!token) {
                setErrorMessage("Authentication token is missing. Please login again.");
                return null;
            }
            const iranyitoszam = parseInt(formData.helyszinIranyitoszam);
            if (isNaN(iranyitoszam) || iranyitoszam < 1000 || iranyitoszam > 9999) {
                setErrorMessage("Az irányítószám 1000 és 9999 közötti szám kell legyen.");
                return null;
            }
            const locationData = {
                Nev: formData.helyszinNev,
                Cim: formData.helyszinCim,
                Telepules: formData.helyszinTelepules,
                Iranyitoszam: iranyitoszam,
                Fedett: formData.helyszinFedett === true,
                Oltozo: formData.helyszinOltozo === true,
                Parkolas: formData.helyszinParkolas || "nincs",
                Berles: formData.helyszinBerles === true,
                Leiras: formData.helyszinLeiras || ""
            };
            
            if (!["ingyenes", "fizetős", "nincs"].includes(locationData.Parkolas)) {
                locationData.Parkolas = "nincs";
            }
            
            const response = await fetch(`http://localhost:8081/api/v1/updateHelyszin/${formData.helyszinId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(locationData),
            });
            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.message || "Failed to save location");
            }
            const responseData = await response.json();
           
            await fetchLocations();
            if (responseData.updatedLocation) {
                setFormData(prev => ({
                    ...prev,
                    helyszinNev: responseData.updatedLocation.Nev,
                    helyszinCim: responseData.updatedLocation.Cim,
                    helyszinTelepules: responseData.updatedLocation.Telepules,
                    helyszinIranyitoszam: responseData.updatedLocation.Iranyitoszam,
                    helyszinFedett: responseData.updatedLocation.Fedett,
                    helyszinOltozo: responseData.updatedLocation.Oltozo,
                    helyszinParkolas: responseData.updatedLocation.Parkolas,
                    helyszinBerles: responseData.updatedLocation.Berles,
                    helyszinLeiras: responseData.updatedLocation.Leiras || ""
                }));
            }
            setEditingLocation(false);
            return formData.helyszinId;
        } catch (error) {
            console.error("Error saving location:", error);
            setErrorMessage(error.message || "An error occurred while saving the location");
            return null;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        setSuccess(false);
        try {
            const token = getCookie('token');
            if (!token) {
                setErrorMessage("Authentication token is missing. Please login again.");
                setSubmitting(false);
                return;
            }
            let finalHelyszinId = formData.helyszinId;
            if (editingLocation) {
                const savedLocationId = await saveLocation();
                if (!savedLocationId) {
                    throw new Error("Failed to save location");
                }
                finalHelyszinId = savedLocationId;
            }
            const formDataToSend = new FormData();
            formDataToSend.append("helyszinId", finalHelyszinId);
            formDataToSend.append("sportId", formData.sportId);
            formDataToSend.append("kezdoIdo", formData.kezdoIdo);
            formDataToSend.append("zaroIdo", formData.zaroIdo);
            formDataToSend.append("szint", formData.szint);
            formDataToSend.append("minimumEletkor", formData.minimumEletkor);
            formDataToSend.append("maximumEletkor", formData.maximumEletkor);
            formDataToSend.append("maximumLetszam", formData.maximumLetszam);
            formDataToSend.append("leiras", formData.leiras);
            formDataToSend.append("autoApprove", formData.autoApprove);
            if (imageFile) {
                formDataToSend.append("imageFile", imageFile);
            }
            formDataToSend.append("id", safeEvent.id);
            
            const response = await fetch(`http://localhost:8081/api/v1/updateEsemeny/${safeEvent.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to update event");
            }
            
            setSuccess(true);
            if (onSuccess) {
                const updatedEvent = {
                    ...safeEvent,
                    id: safeEvent.id,
                    helyszinId: finalHelyszinId,
                    sportId: formData.sportId,
                    kezdoIdo: formData.kezdoIdo,
                    zaroIdo: formData.zaroIdo,
                    szint: formData.szint,
                    minimumEletkor: formData.minimumEletkor,
                    maximumEletkor: formData.maximumEletkor,
                    maximumLetszam: formData.maximumLetszam,
                    leiras: formData.leiras,
                    autoApprove: formData.autoApprove,
                    Helyszin: {
                        Id: finalHelyszinId,
                        Nev: formData.helyszinNev,
                        Cim: formData.helyszinCim,
                        Telepules: formData.helyszinTelepules,
                        Iranyitoszam: parseInt(formData.helyszinIranyitoszam),
                        Fedett: Boolean(formData.helyszinFedett),
                        Oltozo: Boolean(formData.helyszinOltozo),
                        Parkolas: formData.helyszinParkolas,
                        Berles: Boolean(formData.helyszinBerles),
                        Leiras: formData.helyszinLeiras || ""
                    },
                    imageUrl: data.esemeny?.imageUrl || safeEvent.imageUrl
                };

                if (formData.sportId !== safeEvent.sportId) {
                    const newSport = sports.find(sport => sport.Id.toString() === formData.sportId.toString());
                    if (newSport) {
                        updatedEvent.Sportok = newSport;
                    }
                }
                
                onSuccess(updatedEvent);
            }
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setErrorMessage(error.message || "An error occurred while updating the event");
        } finally {
            setSubmitting(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70] transition-all duration-300">
            <div
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-700/50"
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
                                Esemény szerkesztése
                            </h2>
                            <p className="text-gray-400 mt-1">Módosítsd az esemény adatait</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 rounded-full p-2 transition-all duration-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
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
                            <p>Az esemény sikeresen frissítve!</p>
                        </div>
                    )}
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
                        <div className="mb-6">
                            <div className="flex border-b border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setEditingLocation(false)}
                                    className={`py-2 px-4 font-medium text-sm ${!editingLocation
                                        ? "text-purple-400 border-b-2 border-purple-400"
                                        : "text-gray-400 hover:text-gray-300"
                                        }`}
                                >
                                    Esemény adatok
                                </button>
                                <button
                                    type="button"
                                    onClick={startLocationEditing}
                                    className={`py-2 px-4 font-medium text-sm ${editingLocation
                                        ? "text-purple-400 border-b-2 border-purple-400"
                                        : "text-gray-400 hover:text-gray-300"
                                        }`}
                                >
                                    Helyszín adatok
                                </button>
                            </div>
                        </div>
                        {!editingLocation ? (
                            <div className="grid gap-6 mb-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="sportSearch" className="block mb-2 text-sm font-medium text-gray-300">
                                        Sport
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="sportSearch"
                                            className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                            placeholder="Kezdj el gépelni a sport kereséséhez..."
                                            value={formData.sportSearch || ""}
                                            onChange={handleSportSearchChange}
                                            onFocus={() => setShowSportDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowSportDropdown(false), 200)}
                                            autoComplete="off"
                                            required
                                        />

                                        {showSportDropdown && formData.sportSearch && filteredSports.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600/50 rounded-xl shadow-lg max-h-60 overflow-auto">
                                                {filteredSports.map(sport => (
                                                    <div
                                                        key={sport.Id}
                                                        className="p-3 hover:bg-slate-700 cursor-pointer transition-colors text-white"
                                                        onClick={() => handleSportSelect(sport)}
                                                    >
                                                        {sport.Nev}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {showSportDropdown && formData.sportSearch && filteredSports.length === 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600/50 rounded-xl shadow-lg p-3 text-gray-400">
                                                Nincs találat
                                            </div>
                                        )}

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

                                        <input
                                            type="hidden"
                                            id="sportId"
                                            value={formData.sportId}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="maximumLetszam" className="block mb-2 text-sm font-medium text-gray-300">
                                        Létszám
                                    </label>
                                    <input
                                        type="number"
                                        id="maximumLetszam"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        placeholder="Pl. 5"
                                        min="1"
                                        max="100"
                                        value={formData.maximumLetszam}
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
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
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
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        value={formData.zaroIdo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="minimumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                                        Minimum életkor
                                    </label>
                                    <input
                                        type="number"
                                        id="minimumEletkor"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
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
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        placeholder="Pl. 99"
                                        min="1"
                                        max="100"
                                        value={formData.maximumEletkor}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="szint" className="block mb-2 text-sm font-medium text-gray-300">
                                        Szint
                                    </label>
                                    <select id="szint"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
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
                                <div className="md:col-span-2">
                                    <label htmlFor="imageFile" className="block mb-2 text-sm font-medium text-gray-300">
                                        Kép cseréje (opcionális)
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
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600/50 hover:border-purple-500/50 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300"
                                        >
                                            {imagePreview ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="max-h-full max-w-full object-contain rounded-lg"
                                                        onError={(e) => {
                                                            console.error("Error loading image:", imagePreview);
                                                            e.target.src = "/placeholder.svg";
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg
                                                        className="w-8 h-8 mb-3 text-gray-400"
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
                                                    <p className="mb-2 text-sm text-gray-400">
                                                        <span className="font-semibold">Kattints a feltöltéshez</span> vagy húzd ide a fájlt
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        SVG, PNG, JPG vagy GIF (MAX. 2MB)
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 mb-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="helyszinNev" className="block mb-2 text-sm font-medium text-gray-300">
                                        Helyszín neve
                                    </label>
                                    <input
                                        type="text"
                                        id="helyszinNev"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        placeholder="Pl. Városi Sportpálya"
                                        value={formData.helyszinNev}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="helyszinTelepules" className="block mb-2 text-sm font-medium text-gray-300">
                                        Település
                                    </label>
                                    <input
                                        type="text"
                                        id="helyszinTelepules"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        placeholder="Pl. Budapest"
                                        value={formData.helyszinTelepules}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="helyszinCim" className="block mb-2 text-sm font-medium text-gray-300">
                                        Cím
                                    </label>
                                    <input
                                        type="text"
                                        id="helyszinCim"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        placeholder="Pl. Példa utca 123."
                                        value={formData.helyszinCim}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="helyszinIranyitoszam" className="block mb-2 text-sm font-medium text-gray-300">
                                        Irányítószám
                                    </label>
                                    <input
                                        type="text"
                                        id="helyszinIranyitoszam"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        placeholder="Pl. 1234"
                                        value={formData.helyszinIranyitoszam}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="helyszinParkolas" className="block mb-2 text-sm font-medium text-gray-300">
                                        Parkolás
                                    </label>
                                    <select
                                        id="helyszinParkolas"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                                        value={formData.helyszinParkolas}
                                        onChange={handleChange}
                                        required
                                    >
                                        {parkolasOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/80 border border-slate-600/50 rounded-xl p-3 transition-all duration-300">
                                        <label htmlFor="helyszinFedett" className="flex items-center justify-between cursor-pointer w-full">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-300">Fedett helyszín</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.helyszinFedett ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                {formData.helyszinFedett ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                id="helyszinFedett"
                                                className="sr-only" 
                                                checked={formData.helyszinFedett}
                                                onChange={handleChange}
                                            />
                                        </label>
                                    </div>
                                    <div className="bg-slate-800/80 border border-slate-600/50 rounded-xl p-3 transition-all duration-300">
                                        <label htmlFor="helyszinOltozo" className="flex items-center justify-between cursor-pointer w-full">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                                                    
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                                        <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
                                                        <path d="M2 20h3"></path>
                                                        <path d="M13 20h9"></path>
                                                        <path d="M10 12v.01"></path>
                                                        <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-300">Öltöző elérhető</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.helyszinOltozo ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                {formData.helyszinOltozo ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                id="helyszinOltozo"
                                                className="sr-only" 
                                                checked={formData.helyszinOltozo}
                                                onChange={handleChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="helyszinLeiras" className="block mb-2 text-sm font-medium text-gray-300">
                                        Leírás
                                    </label>
                                    <textarea
                                        id="helyszinLeiras"
                                        rows="4"
                                        className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50 custom-scrollbar"
                                        placeholder="Leírás..."
                                        value={formData.helyszinLeiras}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                            </div>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            {editingLocation ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={cancelLocationEditing}
                                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                                    >
                                        Vissza
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveLocation}
                                        className="text-white font-medium rounded-xl text-sm px-6 py-3.5 text-center transition duration-300 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-700/20 hover:shadow-purple-700/40"
                                    >
                                        Helyszín mentése
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                                    >
                                        Mégsem
                                    </button>
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
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Mentés...
                                            </div>
                                        ) : (
                                            "Mentés"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default EventEditModal;


