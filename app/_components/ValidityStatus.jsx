import React from 'react';
import { Clock } from 'lucide-react';

const ValidityStatus = ({ expiryDate }) => {
  const currentDate = new Date();
  const expiry = new Date(expiryDate);
  const isValid = expiry > currentDate;

  return (
    <div
      className={`flex items-center ${
        isValid ? 'text-green-500' : 'text-red-500'
      }`}
    >
      <Clock className="mr-2" />
      {isValid ? (
        <span>Valid until {expiry.toLocaleDateString()}</span>
      ) : (
        <span>Expired on {expiry.toLocaleDateString()}</span>
      )}
    </div>
  );
};

export default ValidityStatus;
