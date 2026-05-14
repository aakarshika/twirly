import React from 'react';
import './ColorCoding.css';

const ColorCoding = ({ color, isActive }) => {
  return (
    <div className={`color-coding ${isActive ? 'active' : ''}`}>
      <div
        className="color-indicator"
        style={{ backgroundColor: color }}
      />
      <div
        className="color-highlight"
        style={{ borderColor: color }}
      />
    </div>
  );
};

export default ColorCoding;
