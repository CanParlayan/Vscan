"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import "./style.css";
import Logo from "../components/logo";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful
      setLoginError("");
      console.log(data.message); // Optional: handle success message
    } else {
      // Login failed
      setLoginError(data.message);
    }
  } catch (error) {
    console.error("Login failed:", error);
    setLoginError("Login failed. Please try again.");
  }
};

  return (
    <div>
      <h1 className="main-text">Are you feeling Vulnerable?</h1>
      <div className="page-container">
        <div className="logokismi">
          <Logo />
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
                onChange={handleEmailChange}
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
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="button">
              Login
            </button>
            {loginError && <p className="error">{loginError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
