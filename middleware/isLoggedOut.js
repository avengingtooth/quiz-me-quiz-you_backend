import jwt_decode from 'jwt-decode';

export const isLoggedOut = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('token');
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};
