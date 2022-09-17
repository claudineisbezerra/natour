/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';


export const getReview = async (id) => {
  console.log('getReview Called...')
};

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

  // alert('updateReview backURL '+ data.get('backURL'));
  // console.log('updateReview data.get(backURL): ', data.get('backURL'));
  // console.log('updateReview backURL: ', backURL);

  // alert('updateReview data.get(reviewId): '+ data.get('reviewId'));
  // console.log('updateReview data.get(reviewId): ', data.get('reviewId'));

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


    // location.assign(backURL);
    // console.log('res.redirect(back): ', res.redirect(back))
    // location.assign('/tour/the-sea-explorer');
    // location.assign('/my-reviews');

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