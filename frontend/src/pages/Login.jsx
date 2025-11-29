import React, { useState } from "react";
import { login } from "../api/api"; // <-- import login() from api.js

function Login() {
  const [username, setUsername] = useState(""); // Django uses username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Call backend to get access + refresh tokens
      await login(username, password);
      window.location.href = "/pos"; // redirect to POS page
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 min-h-full py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg w-80 shadow-lg border border-gray-200"
      >
        <h2 className="m-0 mb-6 text-2xl font-bold text-gray-800 text-center">
          Sign In
        </h2>

        {error && (
          <p className="bg-red-50 px-3 py-3 rounded text-red-700 text-sm mb-4 border border-red-200">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none cursor-pointer font-semibold text-base hover:shadow-lg transition-shadow"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;