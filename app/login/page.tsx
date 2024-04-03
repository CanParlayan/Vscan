"use client";
import React from "react";
import "./style.css";

const LoginPage = () => {
  return (
    <html>
      <body>
        <div className="container">
          <div className="loginBox">
            <h2>Login</h2>

            <div className="formGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="formGroup">
              <label htmlFor="password">Password</label>
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
