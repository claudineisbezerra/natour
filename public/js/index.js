/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { signup, login, logout } from './registration';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview, updateReview, deleteReview } from './review';
import { myFavorites } from './tour';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementsByName('book-tour');
const favoriteList = document.getElementsByName('favorite-list');
const myFavoriteLnk = document.getElementById('lnk_my-favorites');
const manageCreateReviewBtn = document.getElementById('btn-manage-create-review');
const manageUpdateReviewBtn = document.getElementById('btn-manage-update-review');
const manageDeleteReviewsBtn = document.getElementById('btn-manage-delete-reviews');
const manageDeleteReviewBtn = document.getElementsByName('btn-manage-delete-review');
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
    e.stopPropagation();
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
  logOutBtn.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });
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

if (manageDeleteReviewsBtn) {
  manageDeleteReviewsBtn.addEventListener('click', async e => {
    e.preventDefault();

    //- Remove an hide checkbox rows
    let boxes = document.querySelectorAll(".checkbox-review-row");
    let checkedIds = [];

    boxes.forEach((box) => {
        const checkBox = box.querySelector('[name="checkbox-review"]');
        if (checkBox.checked === true) {
            checkedIds.push(checkBox.id);
            box.style.display = "none";
        }
    })

    if(checkedIds.length <= 0) {
      const alertMessage = 'There is no selected itens!'
      showAlert('success', alertMessage, 10);
      checkedIds.length = 0
      return false
    }

    //- Uncheck checkbox-all once all elements was deleted
    let elements = document.querySelectorAll(".checkbox-review-row");
    let count = 0;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].style.display != "none") {
        count++
      }
    }
    if (count <= 0) {
        document.getElementById('select-all-reviews').checked = false
    }

    // const oldTextContent = e.target.textContent;
    // e.target.textContent = 'Creating new review ...';

    // let data = new FormData();
    // data.append('tourId', document.getElementById('tour-id').value );
    // data.append('reviewTitle', document.getElementById('review-title').value );
    // data.append('reviewContent', document.getElementById('review-content').value );
    // data.append('reviewRating', document.getElementById("starwrap").getStars() );
    // data.append('backURL', document.getElementById("backURL").value );
    // await createReview(data);

    // e.target.textContent = oldTextContent;
  });
};

if (manageDeleteReviewBtn) {
  let checkedIds = [];
  Array.from(manageDeleteReviewBtn)
  .forEach(element => {
    element.addEventListener('click', e => {
      let parent = element.closest(".checkbox-review-row");
      let reviewId = element.getAttribute('data-review-id');
      parent.style.display = "none";
      checkedIds.push(reviewId)

    // const oldTextContent = e.target.textContent;
    // e.target.textContent = 'Creating new review ...';

    // let data = new FormData();
    // data.append('tourId', document.getElementById('tour-id').value );
    // data.append('reviewTitle', document.getElementById('review-title').value );
    // data.append('reviewContent', document.getElementById('review-content').value );
    // data.append('reviewRating', document.getElementById("starwrap").getStars() );
    // data.append('backURL', document.getElementById("backURL").value );
    // await createReview(data);

    // e.target.textContent = oldTextContent;

    });
  });
};

if (manageCreateReviewBtn) {
  manageCreateReviewBtn.addEventListener('click', async e => {
    e.preventDefault();
     console.log('manageCreateReviewBtn')
   
    try {
      const href = `/manage-reviews?action=manage-reviews.create`
      window.location.href = href;
    } catch (err) {
      showAlert('error', err);
    }


    // const oldTextContent = e.target.textContent;
    // e.target.textContent = 'Creating new review ...';

    // let data = new FormData();
    // data.append('tourId', document.getElementById('tour-id').value );
    // data.append('reviewTitle', document.getElementById('review-title').value );
    // data.append('reviewContent', document.getElementById('review-content').value );
    // data.append('reviewRating', document.getElementById("starwrap").getStars() );
    // data.append('backURL', document.getElementById("backURL").value );
    // await createReview(data);

    // e.target.textContent = oldTextContent;
  });
};

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

// Set localStorage Favorite List
if(favoriteList){
  // Check if browser supports localStorage
  // if (typeof(Storage) !== "undefined") {
  //   // Code for localStorage
  //   } else {
  //   // No web storage Support.
  // }

  // get favorites from local storage or empty array - Transform string into object
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // set correct icon for favorited item
  favorites.forEach(function(favorite) {
    if(document.getElementById(favorite)) {
      const firstChild =  document.getElementById(favorite).firstChild;
      firstChild.setAttribute("xlink:href", "img/icons.svg#icon-fixed-star-fill");
    }
  });

  Array.from(favoriteList)
  .forEach(element => {
    element.addEventListener('click', e => {
      let id = e.target.id,
      item = e.target,
      index = favorites.indexOf(id);

      // return if target doesn't have an id (shouldn't happen)
      if (!id) return;

      // item is not favorite
      if (index == -1) {
        // Set new icon to <use> tag
        item.firstChild.setAttribute("xlink:href", "img/icons.svg#icon-fixed-star-fill");
        item.classList.add("favorite");
        favorites.push(id);
      // Item is already favorite
      } else {
        item.firstChild.setAttribute("xlink:href", "img/icons.svg#icon-fixed-star");
        item.classList.remove("favorite");
        favorites.splice(index, 1);
      }
      // store array in local storage
      // local storage stores strings so we use JSON to stringify for storage and parse to get out of storage
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
  });
}

// Send localStorage as parameter for DB Search
if(myFavoriteLnk){
  // get favorite tours from local storage or empty array
  myFavoriteLnk.addEventListener('click', async e => {
    e.preventDefault();
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [] ;
    if (favorites && favorites.length > 0) {
      myFavorites(favorites);
    } else {
      const alertMessage = 'You have no Favorite Tours for now!'
      showAlert('success', alertMessage, 10);
      return
    }
  });
}


const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);
