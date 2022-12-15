/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51L1FvoCtYJ2cb6mbCwWT75AXvUH7PZ7BCVcB5h45X5gsD0UyN3r786YpSCcJhXzQRyasKQaTPOfNNKFNwu8PxXnY0069pAYCzR');
// const stripe = require('stripe')(process.env.STRIPE_PUBLIC_KEY);

// todo: Relative URL like yhis: '/api/v1/bookings/'
// will only work if API is installed at same server as frontend.
// If frontend is installed in one server and backed in another,
// will be required to use full path.
export const bookTour = async (tourId, clientReferenceId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}?clientReferenceId=${clientReferenceId}`);

    // 2) Create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
