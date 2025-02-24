import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Initialize navigate function

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
        const response = await fetch("http://localhost:8081/api/v1/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Change the keys here to match the backend expectations
            body: JSON.stringify({ email: email, password: password }), // Use 'email' and 'password'
        });

        const data = await response.json();

        if (response.ok) {
            // Save JWT token in cookies
            Cookies.set("token", data.token, { expires: 1 }); // Token expires in 1 day
            setSuccess("Sikeres bejelentkezés!");

            // Redirect to protected page after 1 second
            setTimeout(() => navigate("/protected"), 1000);
        } else {
            setError(data.message || "Hiba történt a bejelentkezés során!");
        }
    } catch (err) {
        setError("Hiba történt a bejelentkezés során!");
    }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Sign in to your account</h1>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-2">{success}</div>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Your email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            Sign in
          </button>
          <p className="text-sm text-gray-500 text-center">
            Don't have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
