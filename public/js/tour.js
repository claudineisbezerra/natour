/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

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
