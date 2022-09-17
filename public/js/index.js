/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { signup, login, logout } from './registration';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview, updateReview, deleteReview } from './review';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
// const reviewForm = document.querySelector('.form-review-data');
// const myReviewForm = document.querySelector('.form--review');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementsByName('book-tour');
const createReviewBtn = document.getElementById('btn-create-review');
const updateReviewBtn = document.getElementById('btn-update-review');
const deleteReviewBtn = document.getElementById('btn-delete-review');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (createReviewBtn) {
  createReviewBtn.addEventListener('click', async e => {
    e.preventDefault();
    const oldTextContent = e.target.textContent;
    e.target.textContent = 'Creating new review ...';

    let data = new FormData();
    data.append('tourId', document.getElementById('tour-id').value );
    data.append('reviewTitle', document.getElementById('review-title').value );
    data.append('reviewContent', document.getElementById('review-content').value );
    data.append('reviewRating', document.getElementById("starwrap").getStars() );
    data.append('backURL', document.getElementById("backURL").value );
    await createReview(data);

    e.target.textContent = oldTextContent;
  });
};

if (updateReviewBtn) {
  updateReviewBtn.addEventListener('click', async e => {
    e.preventDefault();
    const oldTextContent = e.target.textContent;
    e.target.textContent = 'Creating new review ...';

    let data = new FormData();
    data.append('reviewId', document.getElementById('review-id').value );
    data.append('tourId', document.getElementById('tour-id').value );
    data.append('reviewTitle', document.getElementById('review-title').value );
    data.append('reviewContent', document.getElementById('review-content').value );
    data.append('reviewRating', document.getElementById("starwrap").getStars() );
    data.append('backURL', document.getElementById("backURL").value );
    await updateReview(data);

    e.target.textContent = oldTextContent;
    document.getElementById('review-title').value = '';
    document.getElementById('review-content').value = '';
  });
};

if (deleteReviewBtn) {
  deleteReviewBtn.addEventListener('click', async e => {
    e.preventDefault();
    e.target.textContent = 'Deleting...';

    let data = new FormData();
    data.append('reviewId', document.getElementById('review-id').value );
    data.append('tourId', document.getElementById('tour-id').value );
    data.append('backURL', document.getElementById("backURL").value );
    
    await deleteReview(data);

    e.target.textContent = 'Delete rating';
    document.getElementById('review-title').value = '';
    document.getElementById('review-content').value = '';
  });
};

if (bookBtn) {
  // Attach click event to every button
  Array.from(bookBtn)
  .forEach(element => {
    element.addEventListener('click', e => {
      e.target.textContent = 'Processing...';
      const { tourId, clientReferenceId } = e.target.dataset;
      bookTour(tourId, clientReferenceId);
    });
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
