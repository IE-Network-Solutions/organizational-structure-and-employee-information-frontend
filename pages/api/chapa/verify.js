import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { tx_ref } = req.query;
    if (!tx_ref) {
      return res
        .status(400)
        .json({ error: 'Transaction reference is missing' });
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaSecretKey) {
      return res
        .status(500)
        .json({ error: 'Chapa secret key is missing in server configuration' });
    }

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
        },
      },
    );

    if (response.data.status === 'success') {
      res
        .status(200)
        .json({ status: 'success', message: 'Payment Successful!' });
    } else {
      res
        .status(400)
        .json({
          status: 'failed',
          message: 'Payment failed or status unknown',
        });
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Error verifying payment status';
    res.status(500).json({ error: errorMessage });
  }
}
