/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51L1FvoCtYJ2cb6mbCwWT75AXvUH7PZ7BCVcB5h45X5gsD0UyN3r786YpSCcJhXzQRyasKQaTPOfNNKFNwu8PxXnY0069pAYCzR');
// const stripe = require('stripe')(process.env.STRIPE_PUBLIC_KEY);


export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
