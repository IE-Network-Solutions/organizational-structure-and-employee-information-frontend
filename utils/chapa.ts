export const initializeChapaPayment = async ({
  amount,
  email,
  first_name,
  last_name,
  phone,
}: {
  amount: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}) => {
  const tx_ref = `tx-${Date.now()}`;
  const callback_url = `${window.location.origin}/client-management/clients`;

  const payload = {
    amount,
    currency: 'ETB',
    email,
    first_name,
    last_name,
    phone,
    tx_ref,
    callback_url,
    return_url: callback_url,
  };

  try {
    const response = await fetch('/api/chapa/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      window.location.href = data.data.checkout_url;
    } else {
      throw new Error(data.message || 'Failed to initialize Chapa payment');
    }
  } catch (error) {
    console.error('Error initializing Chapa payment:', error);
  }
};
