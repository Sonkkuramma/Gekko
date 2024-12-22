'use client';

import React from 'react';

const ClientButton = ({ option, index, availableOptions, getResult, onClick }) => {
  const handleClick = () => {
    if (getResult) {
      getResult(index);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`p-4 bg-blue-500 text-white rounded ${
        availableOptions && availableOptions.includes(index) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
      }`}
      onClick={handleClick}
      disabled={availableOptions && !availableOptions.includes(index)}
      type="button"
    >
      {option}
    </button>
  );
};

export default ClientButton;
