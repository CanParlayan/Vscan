"use client";
import React from "react";
import "./style.css";
import Logo from "../components/logo";

const LoginPage = () => {
  return (
    <html>
      <body>
        <h1 className="main-text">Are you feeling Vulnerable?</h1>
        <div className="page-container">
          <div className="logokismi">
            <Logo />
          </div>
          <div className="loginBox">
            <h2>Login</h2>
            <div className="formGroup">
              <label htmlFor="title">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="formGroup">
              <label htmlFor="title">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
              />
            </div>
            <button className="button">Login</button>
          </div>
        </div>
      </body>
    </html>
  );
};

export default LoginPage;
