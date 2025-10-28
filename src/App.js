import React, { useState } from "react";
import "./index.css";

// Base URLs (as per the given challenge: Open-Meteo)
const GEOCODE_BASE = "https://geocoding-api.open-meteo.com/v1/search?name=";
const WEATHER_BASE =
  "https://api.open-meteo.com/v1/forecast?current_weather=true&timezone=auto";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("");

  // Handle search button click
  async function handleSearch(e) {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setError("");
    setWeather(null);
    setLoading(true);

    try {
      // Step 1 — Get latitude and longitude
      //const geoRes = await fetch(GEOCODE_BASE + encodeURIComponent(city));
      const geoRes = await fetch(
        `${GEOCODE_BASE}${encodeURIComponent(city)}&count=10&language=en`
      );
      const geoJson = await geoRes.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        setError("City not found. Try again!");
        setLoading(false);
        return;
      }

      // const top = geoJson.results[0];
      const top = geoJson.results.find(
        (place) => place.country && place.latitude && place.longitude
      );

      const lat = top.latitude;
      const lon = top.longitude;
      setLocationName(`${top.name}, ${top.country}`);

      // Step 2 — Get current weather
      const weatherRes = await fetch(
        `${WEATHER_BASE}&latitude=${lat}&longitude=${lon}`
      );
      const weatherJson = await weatherRes.json();

      const current = weatherJson.current_weather;
      setWeather(current);

      // Step 3 — Change background dynamically
      document.body.className = getBackground(current.weathercode);
    } catch (err) {
      console.error(err);
      setError("Error fetching weather data.");
    } finally {
      setLoading(false);
    }
  }

  // Background logic
  function getBackground(code) {
    if ([0, 1].includes(code)) return "sunny";
    if ([2, 3, 45, 48].includes(code)) return "cloudy";
    if ([61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
    if ([71, 73, 75].includes(code)) return "snowy";
    if ([95, 96, 99].includes(code)) return "storm";
    return "default";
  }

  // Emoji + Description
  function decodeWeather(code) {
    const map = {
      0: "Clear sky ☀️",
      1: "Mainly clear 🌤️",
      2: "Partly cloudy ⛅",
      3: "Overcast ☁️",
      45: "Fog 🌫️",
      61: "Light rain 🌦️",
      63: "Moderate rain 🌧️",
      65: "Heavy rain ⛈️",
      71: "Snow 🌨️",
      95: "Thunderstorm ⚡",
    };
    return map[code] || "Weather info unavailable 🌈";
  }

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Weather Now 🌍</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {weather && (
          <div className="card">
            <h2>{locationName}</h2>
            <div className="temp">{weather.temperature}°C</div>
            <p className="condition">{decodeWeather(weather.weathercode)}</p>
            <p className="wind">💨 Wind Speed: {weather.windspeed} km/h</p>
            <p className="time">
              ⏱ Updated: {new Date(weather.time).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
