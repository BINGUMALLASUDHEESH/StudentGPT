// SpinnerButton.js
import React from 'react';
import { ClipLoader } from 'react-spinners';
import './SpinnerButton.css';

const SpinnerButton = ({ onClick, loading, text }) => {
  return (
    <button onClick={onClick} disabled={loading} className="spinner-button">
      {loading ? <ClipLoader size={20} color={"#ffffff"} /> : text}
    </button>
  );
};

export default SpinnerButton;
