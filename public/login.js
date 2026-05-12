const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

// Assume you have forms with these IDs in your HTML
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// --- UI TOGGLES ---
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// --- LOGIN LOGIC ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the page from reloading

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      showNotification("Login successful!", false);
      
      // 1. Save the secure token and user role to the browser
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);

      // 2. Redirect to the admin dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/dashboard.html'; 
      }, 1000);

    } else {
      showNotification(data.message || "Login failed.", true);
    }
  } catch (error) {
    console.error("Login Error:", error);
    showNotification("Server error. Please try again later.", true);
  }
});

// --- REGISTER LOGIC ---
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the page from reloading

  // Run your existing validation first!
  if (!validateRegisterForm()) return; 

  const name = document.getElementById("register-name").value; // Assuming you added a name field
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      showNotification("Account successfully created!", false);
      
      // Instantly log them in and save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard.html'; 
      }, 1000);
    } else {
      showNotification(data.message || "Registration failed.", true);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    showNotification("Server error. Please try again later.", true);
  }
});

// --- EXISTING VALIDATION & NOTIFICATIONS ---
function validateRegisterForm() {
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm-password").value;
  
  const passwordValid = password.length >= 8 && /\d/.test(password);
  
  if (!passwordValid) {
    showNotification("Password must be at least 8 characters long and contain at least one number.", true);
    return false;
  }
  if (password !== confirmPassword) {
    showNotification("Passwords do not match.", true);
    return false;
  }
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