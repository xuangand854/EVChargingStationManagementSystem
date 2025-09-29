import React from "react";
import "./Home.css";
//xin chao

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to EV Charging Finder</h1>
                <p>Find and book charging stations for your electric vehicle with ease.</p>
            </header>
            <section className="home-features">
                <div className="feature">
                    <h2>🔍 Find Charging Stations</h2>
                    <p>Search for nearby charging stations based on your location or destination.</p>
                </div>
                <div className="feature">
                    <h2>📅 Book in Advance</h2>
                    <p>Reserve a charging slot to ensure availability when you arrive.</p>
                </div>
                <div className="feature">
                    <h2>📊 Real-Time Updates</h2>
                    <p>Get real-time updates on station availability and charging status.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;