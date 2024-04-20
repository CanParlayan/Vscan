// scan/page.tsx
'use client';
import './style.css'
import React from 'react';
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('./scan.client'));

export default function scan() {
    return (
        <html>
        <body>

        <nav className="navBar">
            <div className="logo">SCANNER</div>
            <div className="nav-content">
                <i className="fa-regular fa-moon"></i>
                &nbsp;
                &nbsp;
                &nbsp;
                <i className="fa-solid fa-user"></i>
            </div>
        </nav>

        <nav className="sidebar">

            <ul>

                <li><a href="/"><i className="fas fa-chart-bar"></i> Dashboard</a></li>
                <li><a href="scan"><i className="fas fa-search"></i> Scan</a></li>
                <li><a href="history"><i className="fas fa-history"></i> History</a></li>
            </ul>
        </nav>

        <div className="main-content">
            <h1 className="main-text">This is the scanning page.</h1>

            <ClientComponent />

        </div>


        </body>
        </html>
    )
}