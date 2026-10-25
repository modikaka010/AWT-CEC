
import React from "react";
import "./loader.css";

const leaves = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  className: `falling-leaf leaf-${i + 1}`,
}));

export default function Loader() {
  return (
    <div className="loader-screen">
      {/* Falling leaves */}
      <div className="leaves-layer" aria-hidden="true">
        {leaves.map((leaf) => (
          <img
            key={leaf.id}
            src="/leaf.gif"
            className={leaf.className}
            alt=""
          />
        ))}
      </div>

      {/* Logo and loading animation */}
      <div className="loader-content">
        <img
          src="/avelia-logo.png"
          className="avelia-logo"
          alt="Avelia"
        />

        {/* Loading bar */}
        <div
          className="loading-bar"
          role="progressbar"
          aria-label="Loading"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="loading-bar-fill" />
        </div>

        <div className="loading-info">
          <span>Growing something better</span>

          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}