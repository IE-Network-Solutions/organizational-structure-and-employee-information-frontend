/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      amount,
      email,
      first_name,
      last_name,
      phone,
      tx_ref,
      callback_url,
    } = req.body;

    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount,
        email,
        first_name,
        last_name,
        phone_number: phone,
        tx_ref,
        currency: 'ETB',
        callback_url,
        return_url: callback_url,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    res.status(200).json(chapaResponse.data);
  } catch (error) {
    const errorMessage =
      typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message ||
          error.message ||
          'Failed to initialize payment';

    res.status(500).json({ error: errorMessage });
  }
}
