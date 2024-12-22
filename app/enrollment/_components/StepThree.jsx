'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StepThree({ onNext, onBack }) {
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ paymentInfo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          name="cardNumber"
          value={paymentInfo.cardNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input
          id="expiryDate"
          name="expiryDate"
          placeholder="MM/YY"
          value={paymentInfo.expiryDate}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="cvv">CVV</Label>
        <Input
          id="cvv"
          name="cvv"
          value={paymentInfo.cvv}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" onClick={onBack} variant="outline">
          Back
        </Button>
        <Button type="submit">Complete Payment</Button>
      </div>
    </form>
  );
}
