import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Retrieve the Stripe session using the session_id
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      return res.status(200).json({ payment_status: 'paid' });
    } else if (session.payment_status === 'canceled') {
      return res.status(200).json({ payment_status: 'canceled' });
    } else {
      return res.status(200).json({ payment_status: 'failed' });
    }
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve Stripe session' });
  }
}
