/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// todo: Relative URL like yhis: '/my-favorites'
// will only work if API is installed at same server as frontend.
// If frontend is installed in one server and backed in another,
// will be required to use full path.
export const myFavorites = async (favorites) => {
  if (!favorites && favorites.length <= 0) {
    const alertMessage = 'You have no Favorite Tours for now!'
    showAlert('success', alertMessage, 10);
    return
  }
  try {
    const params = favorites.join(',')
    const href = `/my-favorites?favorites=${params}`
    window.location.href = href;
  } catch (err) {
    showAlert('error', err);
  }
};
