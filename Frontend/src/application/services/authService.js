import { validatePin, validatePassword } from "../../domain/auth"; 

export const authenticateUser = (pinInput, passwordInput, storedPin, storedPassword) => {
  if (validatePin(pinInput, storedPin) && validatePassword(passwordInput, storedPassword)) {
    const seedPhrase = "frase semilla generada aquí";
    return seedPhrase;
  } else {
    throw new Error("PIN o contraseña incorrectos");
  }
};
