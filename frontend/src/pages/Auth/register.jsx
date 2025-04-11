import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

const Register = () => {
  const [felhasznalonev, setFelhasznalonev] = useState("");
  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [jelszoMegerosites, setJelszoMegerosites] = useState("");
  const [telefonszam, setTelefonszam] = useState("");
  const [csaladnev, setCsaladnev] = useState("");
  const [keresztnev, setKeresztnev] = useState("");
  const [szuletesiDatum, setSzuletesiDatum] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [focusedFields, setFocusedFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    lastName: false,
    firstName: false,
    birthDate: false,
  });

  const navigate = useNavigate();


  const validateUsername = (username) => {
    const errors = {};
    if (username.length < 4) {
      errors.username = "A felhasználónév legalább 4 karakter hosszú kell legyen!";
    } else if (username.length > 16) {
      errors.username = "A felhasználónév maximum 16 karakter hosszú lehet!";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      errors.username = "A felhasználónév csak betűket és számokat tartalmazhat!";
    }
    return errors;
  };

  const validateEmail = (email) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Érvénytelen email formátum!";
    }
    return errors;
  };

  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 10) {
      errors.password = "A jelszó legalább 10 karakter hosszú kell legyen!";
    } else if (password.length > 25) {
      errors.password = "A jelszó maximum 25 karakter hosszú lehet!";
    } else {

      const hasLowerCase = /[a-z]/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
      if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        errors.password = "A jelszónak tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert!";
      }
    }
    return errors;
  };

  const validatePasswordConfirmation = (password, confirmation) => {
    const errors = {};
    if (password !== confirmation) {
      errors.confirmPassword = "A két jelszó nem egyezik meg!";
    }
    return errors;
  };

  const validatePhone = (phone) => {
    const errors = {};
    if (phone) {
      const phoneRegex = /^(\+36|06)[ -]?(1|20|30|31|50|70)[ -]?(\d{3}[ -]?\d{4}|\d{2}[ -]?\d{2}[ -]?\d{3})$/;
      if (!phoneRegex.test(phone)) {
        errors.phone = "Érvénytelen magyar telefonszám formátum! Példák: +36201234567, 06-30-123-4567";
      }
    }
    return errors;
  };

  const validateName = (name, fieldName) => {
    const errors = {};
    if (name) {
      if (name.length < 2) {
        errors[fieldName] =
          `A ${fieldName === "firstName" ? "keresztnév" : "családnév"} legalább 2 karakter hosszú kell legyen!`;
      } else if (name.length > 15) {
        errors[fieldName] =
          `A ${fieldName === "firstName" ? "keresztnév" : "családnév"} maximum 15 karakter hosszú lehet!`;
      } else if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/.test(name)) {
        errors[fieldName] = `A ${fieldName === "firstName" ? "keresztnév" : "családnév"} csak betűket tartalmazhat!`;
      }
    }
    return errors;
  };

  const validateBirthDate = (birthDate) => {
    const errors = {};
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();

      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
     
      if (age < 6) {
        errors.birthDate = "A felhasználónak legalább 6 évesnek kell lennie!";
      } else if (age > 100) {
        errors.birthDate = "A felhasználó nem lehet 100 évnél idősebb!";
      }
    }
    return errors;
  };

 
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFelhasznalonev(value);
    if (value) {
      const errors = validateUsername(value);
      setValidationErrors((prev) => ({
        ...prev,
        username: errors.username,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        username: undefined,
      }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      const errors = validateEmail(value);
      setValidationErrors((prev) => ({
        ...prev,
        email: errors.email,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setJelszo(value);
    if (value) {
      const errors = validatePassword(value);
      setValidationErrors((prev) => ({
        ...prev,
        password: errors.password,
      }));
      if (jelszoMegerosites) {
        const confirmErrors = validatePasswordConfirmation(value, jelszoMegerosites);
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: confirmErrors.confirmPassword,
        }));
      }
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        password: undefined,
      }));
    }
  };

  const handlePasswordConfirmationChange = (e) => {
    const value = e.target.value;
    setJelszoMegerosites(value);
    if (value) {
      const errors = validatePasswordConfirmation(jelszo, value);
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: errors.confirmPassword,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: undefined,
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setTelefonszam(value);
    if (value) {
      const errors = validatePhone(value);
      setValidationErrors((prev) => ({
        ...prev,
        phone: errors.phone,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        phone: undefined,
      }));
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setCsaladnev(value);
    if (value) {
      const errors = validateName(value, "lastName");
      setValidationErrors((prev) => ({
        ...prev,
        lastName: errors.lastName,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        lastName: undefined,
      }));
    }
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setKeresztnev(value);
    if (value) {
      const errors = validateName(value, "firstName");
      setValidationErrors((prev) => ({
        ...prev,
        firstName: errors.firstName,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        firstName: undefined,
      }));
    }
  };

  const handleBirthDateChange = (e) => {
    const value = e.target.value;
    setSzuletesiDatum(value);
    if (value) {
      const errors = validateBirthDate(value);
      setValidationErrors((prev) => ({
        ...prev,
        birthDate: errors.birthDate,
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        birthDate: undefined,
      }));
    }
  };

 
  const handleFocus = (field) => {
    setFocusedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleBlur = (field) => {
    setFocusedFields((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    
    const usernameErrors = validateUsername(felhasznalonev);
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(jelszo);
    const confirmPasswordErrors = validatePasswordConfirmation(jelszo, jelszoMegerosites);
    const phoneErrors = validatePhone(telefonszam);
    const lastNameErrors = validateName(csaladnev, "lastName");
    const firstNameErrors = validateName(keresztnev, "firstName");
    const birthDateErrors = validateBirthDate(szuletesiDatum);

   
    setValidationErrors({
      ...validationErrors,
      username: usernameErrors.username,
      email: emailErrors.email,
      password: passwordErrors.password,
      confirmPassword: confirmPasswordErrors.confirmPassword,
      phone: phoneErrors.phone,
      lastName: lastNameErrors.lastName,
      firstName: firstNameErrors.firstName,
      birthDate: birthDateErrors.birthDate,
    });

   
    if (
      usernameErrors.username ||
      emailErrors.email ||
      passwordErrors.password ||
      confirmPasswordErrors.confirmPassword ||
      phoneErrors.phone ||
      lastNameErrors.lastName ||
      firstNameErrors.firstName ||
      birthDateErrors.birthDate
    ) {
      setError("Kérjük, javítsa a hibákat a regisztráció előtt!");
      return;
    }

   
    if (!felhasznalonev || !email || !jelszo || !jelszoMegerosites) {
      setError("Felhasználónév, email, jelszó és jelszó megerősítés megadása kötelező!");
      return;
    }

    
    if (jelszo !== jelszoMegerosites) {
      setError("A jelszavak nem egyeznek meg!");
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

  
const navigateToTerms = (e) => {
  e.preventDefault();
  navigate('/');
  
  setTimeout(() => {
    
    const footerElement = document.querySelector('footer');
    
    if (footerElement) {
      
      footerElement.scrollIntoView({ behavior: 'smooth' });
      
      
      
      const bottomSection = footerElement.querySelector('.border-t.border-slate-700\\/50:last-of-type');
      if (bottomSection) {
        bottomSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, 300); 
};


  return (
    <div className="min-h-screen flex flex-col bg-[#0f1424]">
      
      <header className="border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-400">
              Sporthaver
            </Link>
          </div>
        </div>
      </header>

      
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-[#161b33] border border-slate-700/30 rounded-xl shadow-xl overflow-hidden">
            
            <div className="bg-gradient-to-r from-[#2a2f4c] to-[#252a47] p-6 border-b border-slate-700/30">
              <h1 className="text-2xl font-bold text-white">Fiók létrehozása</h1>
              <p className="text-slate-400 mt-1">Csatlakozz a Sporthaver közösséghez</p>
            </div>

            
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <label className="block text-slate-300 font-medium">Felhasználónév</label>
                  <input
                    type="text"
                    className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.username
                        ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                        : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                      } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                    placeholder="Felhasználónév"
                    value={felhasznalonev}
                    onChange={handleUsernameChange}
                    onFocus={() => handleFocus("username")}
                    onBlur={() => handleBlur("username")}
                    required
                  />
                  {validationErrors.username && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
                  )}
                  {focusedFields.username && !validationErrors.username && (
                    <p className="text-slate-500 text-xs mt-1">
                      A felhasználónév 4-16 karakter hosszú lehet, és csak betűket és számokat tartalmazhat.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-medium">Email</label>
                  <input
                    type="email"
                    className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.email
                        ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                        : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                      } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                    placeholder="nev@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    required
                  />
                  {validationErrors.email && <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>}
                  {focusedFields.email && !validationErrors.email && (
                    <p className="text-slate-500 text-xs mt-1">Adjon meg egy érvényes email címet.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-medium">Jelszó</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.password
                            ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                            : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                          } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                        placeholder="••••••••"
                        value={jelszo}
                        onChange={handlePasswordChange}
                        onFocus={() => handleFocus("password")}
                        onBlur={() => handleBlur("password")}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                    )}
                    {focusedFields.password && !validationErrors.password && (
                      <p className="text-slate-500 text-xs mt-1">
                        A jelszó 10-25 karakter hosszú lehet, és tartalmaznia kell kisbetűt, nagybetűt, számot és
                        speciális karaktert.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-300 font-medium">Jelszó megerősítése</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.confirmPassword
                            ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                            : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                          } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                        placeholder="••••••••"
                        value={jelszoMegerosites}
                        onChange={handlePasswordConfirmationChange}
                        onFocus={() => handleFocus("confirmPassword")}
                        onBlur={() => handleBlur("confirmPassword")}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-medium">Telefonszám</label>
                  <input
                    type="tel"
                    className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.phone
                        ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                        : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                      } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                    placeholder="+36201234567"
                    value={telefonszam}
                    onChange={handlePhoneChange}
                    onFocus={() => handleFocus("phone")}
                    onBlur={() => handleBlur("phone")}
                    required
                  />
                  {validationErrors.phone && <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>}
                  {focusedFields.phone && !validationErrors.phone && (
                    <p className="text-slate-500 text-xs mt-1">
                      Érvényes formátumok: +36201234567, 06-30-123-4567, 06 70 123 4567
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-medium">Családnév</label>
                    <input
                      type="text"
                      className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.lastName
                          ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                          : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                        } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                      placeholder="Családnév"
                      value={csaladnev}
                      onChange={handleLastNameChange}
                      onFocus={() => handleFocus("lastName")}
                      onBlur={() => handleBlur("lastName")}
                      required
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                    {focusedFields.lastName && !validationErrors.lastName && (
                      <p className="text-slate-500 text-xs mt-1">2-15 karakter, csak betűk</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-300 font-medium">Keresztnév</label>
                    <input
                      type="text"
                      className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.firstName
                          ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                          : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                        } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                      placeholder="Keresztnév"
                      value={keresztnev}
                      onChange={handleFirstNameChange}
                      onFocus={() => handleFocus("firstName")}
                      onBlur={() => handleBlur("firstName")}
                      required
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                    {focusedFields.firstName && !validationErrors.firstName && (
                      <p className="text-slate-500 text-xs mt-1">2-15 karakter, csak betűk</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-medium">Születési dátum</label>
                  <input
                    type="date"
                    className={`w-full py-2.5 px-3 bg-slate-800/50 border ${validationErrors.birthDate
                        ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/30"
                        : "border-slate-700/50 focus:border-purple-500/50 focus:ring-purple-500/30"
                      } rounded-md text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none`}
                    value={szuletesiDatum}
                    onChange={handleBirthDateChange}
                    onFocus={() => handleFocus("birthDate")}
                    onBlur={() => handleBlur("birthDate")}
                    required
                  />
                  {validationErrors.birthDate && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.birthDate}</p>
                  )}
                  {focusedFields.birthDate && !validationErrors.birthDate && (
                    <p className="text-slate-500 text-xs mt-1">
                      A felhasználónak legalább 6 évesnek és legfeljebb 100 évesnek kell lennie.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                >
                  <span>Regisztráció</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>

                <p className="text-sm text-slate-400 text-center">
                  Már van fiókod?{" "}
                  <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Bejelentkezés
                  </Link>
                </p>
              </form>
            </div>
          </div>

          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              A regisztrációval elfogadod a{" "}
              <a 
                href="#" 
                onClick={navigateToTerms}
                className="text-purple-400 hover:underline"
              >
                Felhasználási feltételeket
              </a>{" "}
              és az{" "}
              <a 
                href="#" 
                onClick={navigateToTerms}
                className="text-purple-400 hover:underline"
              >
                Adatvédelmi irányelveket
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

