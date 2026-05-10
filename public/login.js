const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function validateRegisterForm() {
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById(
    "register-confirm-password",
  ).value;
  const passwordValid = password.length >= 8 && /\d/.test(password);
  if (!passwordValid) {
    showNotification(
      "Password must be at least 8 characters long and contain at least one number.",
      true,
    );
    return false;
  }
  if (password !== confirmPassword) {
    showNotification("Passwords do not match.", true);
    return false;
  }
  showNotification("Account successfully created!", false);
  return true;
}

function showNotification(message, isError = false) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  if (isError) {
    notification.classList.add("error");
  } else {
    notification.classList.remove("error");
  }
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.remove("error");
  }, 3000);
}
