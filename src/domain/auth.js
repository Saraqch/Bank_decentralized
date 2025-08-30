// domain/auth.js
export const validatePin = (pinInput, storedPin) => {
  return pinInput === storedPin;
};

export const validatePassword = (passwordInput, storedPassword) => {
  return passwordInput === storedPassword;
};
