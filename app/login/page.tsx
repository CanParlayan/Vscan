"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Logo from "../components/logo"; // Make sure to import Logo component
import "./style.css";

const LoginPage = () => {
  // Define state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  // Event handler for email input change
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value);
};

const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
  setPassword(e.target.value);
};


  // Form submission handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // Prevent default form submission behavior
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }), // Sending 'email' and 'password'
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/'; // Redirect on successful login
    } else {
      setLoginError(data.message); // Set login error message
    }
  } catch (error) {
    console.error('Error during login:', error);
    // Handle error (e.g., display generic error message)
  }
};

  // Render the login form
  return (
    <div>
      <h1 className="main-text">Are you feeling Vulnerable?</h1>
      <div className="page-container">
        <div className="logokismi">
          <Logo /> {/* Render Logo component */}
        </div>
        <div className="loginBox">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="formGroup">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange} // Assign the email input change handler
                  placeholder="Enter your email"
                  required
              />
            </div>
            <div className="formGroup">
              <label htmlFor="password">Password</label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange} // Assign the password input change handler
                  placeholder="Enter your password"
                  required
              />
            </div>
            <button type="submit" className="button">
              Login
            </button>
            {loginError && <p className="error">{loginError}</p>} {/* Display login error if exists */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
