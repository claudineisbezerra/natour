/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// todo: Relative URL like yhis: '/api/v1/users/updateMyPassword'
// will only work if API is installed at same server as frontend.
// If frontend is installed in one server and backed in another,
// will be required to use full path.

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
