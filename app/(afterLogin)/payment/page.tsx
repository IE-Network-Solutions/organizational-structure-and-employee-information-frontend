'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const [chapaData, setChapaData] = useState({
    amount: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [stripeAmount, setStripeAmount] = useState('');
  const [chapaResponse, setChapaResponse] = useState<string | null>(null);
  const [stripeResponse, setStripeResponse] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const txRef = searchParams ? searchParams.get('tx_ref') : null; // Get transaction reference for Chapa
  const sessionId = searchParams ? searchParams.get('session_id') : null; // Get session_id for Stripe

  useEffect(() => {
    if (txRef) {
      verifyChapaPayment(txRef);
    }

    if (sessionId) {
      verifyStripePayment(sessionId);
    }
  }, [txRef, sessionId]);

  // Handle Chapa data change
  const handleChapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChapaData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle Stripe amount change
  const handleStripeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStripeAmount(e.target.value);
  };

  // Initialize Chapa Payment
  const initializeChapaPayment = async () => {
    if (!chapaData.amount || Number(chapaData.amount) <= 0) {
      setChapaResponse('Please enter a valid amount.');
      return;
    }

    try {
      const txRef = `chapa-${Date.now()}`; // Generate unique transaction reference
      const callbackUrl = `${window.location.origin}/payment?tx_ref=${txRef}`;

      const response = await fetch('/api/chapa/initiate', {
        method: 'POST',
        body: JSON.stringify({
          ...chapaData,
          tx_ref: txRef,
          callback_url: callbackUrl,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok && data.data?.checkout_url) {
        window.location.href = data.data.checkout_url; // Redirect to Chapa checkout page
      } else {
        setChapaResponse(data.error || 'Failed to initialize Chapa payment.');
      }
    } catch (error) {
      console.error('Chapa payment initialization failed:', error);
      setChapaResponse('An unknown error occurred.');
    }
  };

  // Initialize Stripe Payment
  const initializeStripePayment = async () => {
    if (!stripeAmount || Number(stripeAmount) <= 0) {
      setStripeResponse('Please enter a valid amount.');
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ amount: stripeAmount }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url; // Redirect to Stripe checkout
      } else {
        setStripeResponse('Failed to retrieve Stripe payment URL.');
      }
    } catch (error) {
      console.error('Stripe payment initialization failed:', error);
      setStripeResponse('An unknown error occurred.');
    }
  };

  // Verify Chapa payment status
  const verifyChapaPayment = async (txRef: string) => {
    try {
      const response = await fetch(`/api/chapa/verify?tx_ref=${txRef}`);
      const data = await response.json();
      setChapaResponse(data.message);
    } catch (error) {
      console.error('Chapa payment verification failed:', error);
      setChapaResponse('Failed to verify Chapa payment.');
    }
  };

  // Verify Stripe payment status
  const verifyStripePayment = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/stripe/verify?session_id=${sessionId}`,
      );
      const data = await response.json();
      if (data.payment_status === 'paid') {
        setPaymentStatus('Stripe payment successful!');
      } else if (data.payment_status === 'canceled') {
        setPaymentStatus('Stripe payment was canceled.');
      } else {
        setPaymentStatus('Stripe payment failed.');
      }
    } catch (error) {
      console.error('Stripe payment verification failed:', error);
      setPaymentStatus('Failed to verify Stripe payment.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-center space-x-8 w-full max-w-6xl">
        {/* Chapa Section */}
        <div className="flex flex-col items-center border p-6 rounded-lg shadow-md bg-white w-full max-w-md mb-8">
          <h2 className="text-xl font-bold mb-4">Chapa Payment</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-2 w-full mb-2"
            onChange={handleChapaChange}
          />
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="border p-2 w-full mb-2"
            onChange={handleChapaChange}
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            className="border p-2 w-full mb-2"
            onChange={handleChapaChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="border p-2 w-full mb-2"
            onChange={handleChapaChange}
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount (ETB)"
            className="border p-2 w-full mb-4"
            onChange={handleChapaChange}
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded w-full"
            onClick={initializeChapaPayment}
          >
            Pay with Chapa
          </button>
          {chapaResponse && (
            <p className="mt-4 text-sm text-gray-700">
              Response: {chapaResponse}
            </p>
          )}
        </div>

        {/* Stripe Section */}
        <div className="flex flex-col items-center border p-6 rounded-lg shadow-md bg-white w-full max-w-md mb-8">
          <h2 className="text-xl font-bold mb-4">Stripe Payment</h2>
          <input
            type="number"
            placeholder="Amount (USD)"
            className="border p-2 w-full mb-4"
            onChange={handleStripeChange}
          />
          <button
            className="px-4 py-2 bg-blue text-white rounded w-full"
            onClick={initializeStripePayment}
          >
            Pay with Stripe
          </button>
          {paymentStatus && (
            <p className="mt-4 text-sm text-gray-700">
              Response: {paymentStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
