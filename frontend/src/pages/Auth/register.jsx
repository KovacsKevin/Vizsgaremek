import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [felhasznalonev, setFelhasznalonev] = useState("");
  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [telefonszam, setTelefonszam] = useState("");
  const [csaladnev, setCsaladnev] = useState("");
  const [keresztnev, setKeresztnev] = useState("");
  const [szuletesiDatum, setSzuletesiDatum] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  
  // Új állapotok a mezőkre kattintás nyomon követésére
  const [focusedFields, setFocusedFields] = useState({
    username: false,
    email: false,
    password: false,
    phone: false,
    lastName: false,
    firstName: false,
    birthDate: false
  });
  
  const navigate = useNavigate();

  // Felhasználónév validáció
  const validateUsername = (username) => {
    let errors = {};
    
    if (username.length < 4) {
      errors.username = "A felhasználónév legalább 4 karakter hosszú kell legyen!";
    } else if (username.length > 16) {
      errors.username = "A felhasználónév maximum 16 karakter hosszú lehet!";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      errors.username = "A felhasználónév csak betűket és számokat tartalmazhat!";
    }
    
    return errors;
  };

  // Email validáció
  const validateEmail = (email) => {
    let errors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Érvénytelen email formátum!";
    }
    
    return errors;
  };

  // Jelszó validáció
  const validatePassword = (password) => {
    let errors = {};
    
    if (password.length < 10) {
      errors.password = "A jelszó legalább 10 karakter hosszú kell legyen!";
    } else if (password.length > 25) {
      errors.password = "A jelszó maximum 25 karakter hosszú lehet!";
    } else {
      // Jelszó komplexitás ellenőrzése
      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      
      if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        errors.password = "A jelszónak tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert!";
      }
    }
    
    return errors;
  };

  // Telefonszám validáció
  const validatePhone = (phone) => {
    let errors = {};
    
    if (phone) {
      const phoneRegex = /^(\+36|06)[ -]?(1|20|30|31|50|70)[ -]?(\d{3}[ -]?\d{4}|\d{2}[ -]?\d{2}[ -]?\d{3})$/;
      if (!phoneRegex.test(phone)) {
        errors.phone = "Érvénytelen magyar telefonszám formátum! Példák: +36201234567, 06-30-123-4567";
      }
    }
    
    return errors;
  };

  // Név validáció (keresztnév és családnév)
  const validateName = (name, fieldName) => {
    let errors = {};
    
    if (name) {
      if (name.length < 2) {
        errors[fieldName] = `A ${fieldName === 'firstName' ? 'keresztnév' : 'családnév'} legalább 2 karakter hosszú kell legyen!`;
      } else if (name.length > 15) {
        errors[fieldName] = `A ${fieldName === 'firstName' ? 'keresztnév' : 'családnév'} maximum 15 karakter hosszú lehet!`;
      } else if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/.test(name)) {
        errors[fieldName] = `A ${fieldName === 'firstName' ? 'keresztnév' : 'családnév'} csak betűket tartalmazhat!`;
      }
    }
    
    return errors;
  };

  // Születési dátum validáció
  const validateBirthDate = (birthDate) => {
    let errors = {};
    
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      
      // Életkor kiszámítása
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      // Ellenőrzés: 6-100 év közötti életkor
      if (age < 6) {
        errors.birthDate = "A felhasználónak legalább 6 évesnek kell lennie!";
      } else if (age > 100) {
        errors.birthDate = "A felhasználó nem lehet 100 évnél idősebb!";
      }
    }
    
    return errors;
  };

  // Felhasználónév változás kezelése validációval
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFelhasznalonev(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        username: errors.username
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        username: undefined
      }));
    }
  };

  // Email változás kezelése validációval
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validateEmail(value);
      setValidationErrors(prev => ({
        ...prev,
        email: errors.email
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        email: undefined
      }));
    }
  };

  // Jelszó változás kezelése validációval
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setJelszo(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: errors.password
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        password: undefined
      }));
    }
  };

  // Telefonszám változás kezelése validációval
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setTelefonszam(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validatePhone(value);
      setValidationErrors(prev => ({
        ...prev,
        phone: errors.phone
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        phone: undefined
      }));
    }
  };

  // Családnév változás kezelése validációval
  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setCsaladnev(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validateName(value, 'lastName');
      setValidationErrors(prev => ({
        ...prev,
        lastName: errors.lastName
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        lastName: undefined
      }));
    }
  };

  // Keresztnév változás kezelése validációval
  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setKeresztnev(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validateName(value, 'firstName');
      setValidationErrors(prev => ({
        ...prev,
        firstName: errors.firstName
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        firstName: undefined
      }));
    }
  };

  // Születési dátum változás kezelése validációval
  const handleBirthDateChange = (e) => {
    const value = e.target.value;
    setSzuletesiDatum(value);
    
    // Csak akkor validáljuk, ha már van tartalom
    if (value) {
      const errors = validateBirthDate(value);
      setValidationErrors(prev => ({
        ...prev,
        birthDate: errors.birthDate
      }));
    } else {
      // Ha üres, töröljük a hibaüzenetet
      setValidationErrors(prev => ({
        ...prev,
        birthDate: undefined
      }));
    }
  };
  
  // Új függvények a mezőkre kattintás kezelésére
  const handleFocus = (field) => {
    setFocusedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };
  
  const handleBlur = (field) => {
    setFocusedFields(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Teljes validáció beküldés előtt
    const usernameErrors = validateUsername(felhasznalonev);
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(jelszo);
    const phoneErrors = validatePhone(telefonszam);
    const lastNameErrors = validateName(csaladnev, 'lastName');
    const firstNameErrors = validateName(keresztnev, 'firstName');
    const birthDateErrors = validateBirthDate(szuletesiDatum);
    
    // Frissítjük a validációs hibákat
    setValidationErrors({
      ...validationErrors,
      username: usernameErrors.username,
      email: emailErrors.email,
      password: passwordErrors.password,
      phone: phoneErrors.phone,
      lastName: lastNameErrors.lastName,
      firstName: firstNameErrors.firstName,
      birthDate: birthDateErrors.birthDate
    });
    
    // Ha bármilyen validációs hiba van, megállítjuk a folyamatot
    if (usernameErrors.username || emailErrors.email || passwordErrors.password || 
        phoneErrors.phone || lastNameErrors.lastName || firstNameErrors.firstName ||
        birthDateErrors.birthDate) {
      setError("Kérjük, javítsa a hibákat a regisztráció előtt!");
      return;
    }

    // Basic validation
    if (!felhasznalonev || !email || !jelszo) {
      setError("Felhasználónév, email és jelszó megadása kötelező!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/v1/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: felhasznalonev,
          email: email,
          password: jelszo,
          phone: telefonszam,
          lastName: csaladnev,
          firstName: keresztnev,
          birthDate: szuletesiDatum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Sikeres regisztráció!");
        navigate("/login");
      } else {
        setError(data.message || "Hiba történt a regisztráció során!");
      }
    } catch (err) {
      setError("Nem sikerült csatlakozni a szerverhez!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-zinc-900 text-white p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg p-6 my-8">
        <h1 className="text-2xl font-bold text-center mb-6">Fiók létrehozása</h1>
        
        {error && (
          <div className="mb-4 backdrop-blur-md bg-red-500/20 border border-red-500/30 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 backdrop-blur-md bg-green-500/20 border border-green-500/30 text-white p-3 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Felhasználónév</label>
            <input
              type="text"
              className={`w-full py-2 px-3 bg-white/5 border ${
                validationErrors.username 
                  ? "border-red-500/50 focus:border-red-500/70" 
                  : "border-white/10 focus:border-white/30"
              } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
              placeholder="Felhasználónév"
              value={felhasznalonev}
              onChange={handleUsernameChange}
              onFocus={() => handleFocus('username')}
              onBlur={() => handleBlur('username')}
              required
            />
            {validationErrors.username && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
            )}
            {focusedFields.username && (
              <p className="text-white text-xs mt-1">
                A felhasználónév 4-16 karakter hosszú lehet, és csak betűket és számokat tartalmazhat.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Email</label>
            <input
              type="email"
              className={`w-full py-2 px-3 bg-white/5 border ${
                validationErrors.email 
                  ? "border-red-500/50 focus:border-red-500/70" 
                  : "border-white/10 focus:border-white/30"
              } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
              placeholder="nev@email.com"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              required
            />
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
            {focusedFields.email && (
              <p className="text-white text-xs mt-1">
                Adjon meg egy érvényes email címet.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Jelszó</label>
            <input
              type="password"
              className={`w-full py-2 px-3 bg-white/5 border ${
                validationErrors.password 
                  ? "border-red-500/50 focus:border-red-500/70" 
                  : "border-white/10 focus:border-white/30"
              } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
              placeholder="••••••••"
              value={jelszo}
              onChange={handlePasswordChange}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              required
            />
            {validationErrors.password && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
            )}
            {focusedFields.password && (
              <p className="text-white text-xs mt-1">
                A jelszó 10-25 karakter hosszú lehet, és tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Telefonszám</label>
            <input
              type="tel"
              className={`w-full py-2 px-3 bg-white/5 border ${
                validationErrors.phone 
                  ? "border-red-500/50 focus:border-red-500/70" 
                  : "border-white/10 focus:border-white/30"
              } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
              placeholder="+36201234567"
              value={telefonszam}
              onChange={handlePhoneChange}
              onFocus={() => handleFocus('phone')}
              onBlur={() => handleBlur('phone')}
              required
            />
            {validationErrors.phone && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
            )}
            {focusedFields.phone && (
              <p className="text-white text-xs mt-1">
                Érvényes formátumok: +36201234567, 06-30-123-4567, 06 70 123 4567
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-white/90 font-medium">Családnév</label>
              <input
                type="text"
                className={`w-full py-2 px-3 bg-white/5 border ${
                  validationErrors.lastName 
                    ? "border-red-500/50 focus:border-red-500/70" 
                    : "border-white/10 focus:border-white/30"
                } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
                placeholder="Családnév"
                value={csaladnev}
                onChange={handleLastNameChange}
                onFocus={() => handleFocus('lastName')}
                onBlur={() => handleBlur('lastName')}
                required
              />
              {validationErrors.lastName && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
              )}
              {focusedFields.lastName && (
                <p className="text-white text-xs mt-1">
                  2-15 karakter, csak betűk
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-white/90 font-medium">Keresztnév</label>
              <input
                type="text"
                className={`w-full py-2 px-3 bg-white/5 border ${
                  validationErrors.firstName 
                    ? "border-red-500/50 focus:border-red-500/70" 
                    : "border-white/10 focus:border-white/30"
                } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
                placeholder="Keresztnév"
                value={keresztnev}
                onChange={handleFirstNameChange}
                onFocus={() => handleFocus('firstName')}
                onBlur={() => handleBlur('firstName')}
                required
              />
              {validationErrors.firstName && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.firstName}</p>
              )}
              {focusedFields.firstName && (
                <p className="text-white text-xs mt-1">
                  2-15 karakter, csak betűk
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Születési dátum</label>
            <input
              type="date"
              className={`w-full py-2 px-3 bg-white/5 border ${
                validationErrors.birthDate 
                  ? "border-red-500/50 focus:border-red-500/70" 
                  : "border-white/10 focus:border-white/30"
              } rounded-md text-white placeholder:text-white/40 focus:ring-white/20`}
              value={szuletesiDatum}
              onChange={handleBirthDateChange}
              onFocus={() => handleFocus('birthDate')}
              onBlur={() => handleBlur('birthDate')}
              required
            />
            {validationErrors.birthDate && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.birthDate}</p>
            )}
            {focusedFields.birthDate && (
              <p className="text-white text-xs mt-1">
                A felhasználónak legalább 6 évesnek és legfeljebb 100 évesnek kell lennie.
              </p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-md transition-colors font-medium"
          >
            Regisztráció
          </button>
          
          <p className="text-sm text-white/70 text-center">
            Már van fiókod? <a href="/login" className="text-white hover:text-white/90 transition-colors">Bejelentkezés</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

         


