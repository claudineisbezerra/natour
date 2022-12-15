/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// todo: Relative URL like yhis: '/api/v1/reviews'
// will only work if API is installed at same server as frontend.
// If frontend is installed in one server and backed in another,
// will be required to use full path.
export const createReview = async (data) => {
  const backURL = data.get('backURL') ? data.get('backURL') : '/my-reviews';
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        "title": data.get('reviewTitle'),
        "content": data.get('reviewContent'),
        "rating": data.get('reviewRating'),
        "tour": data.get('tourId'),
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review successfully created!');
      window.setTimeout(() => {
        location.assign(backURL);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateReview = async (data) => {
  const backURL = data.get('backURL') ? data.get('backURL') : '/my-reviews';
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${data.get('reviewId')}`,
      data: {
        "title": data.get('reviewTitle'),
        "content": data.get('reviewContent'),
        "rating": data.get('reviewRating'),
        "tour": data.get('tourId'),
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review successfully updated!');
      window.setTimeout(() => {
        location.assign(backURL);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteReview = async (data) => {
  const backURL = data.get('backURL') ? data.get('backURL') : '/my-reviews';
   try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${data.get('reviewId')}`,
      data: {
        "tour": data.get('tourId'),
      }
    });

    if (res.data.status === 'success' || res.status === 204) {
      showAlert('success', 'Review successfully deleted!');
      window.setTimeout(() => {
        location.assign(backURL);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};