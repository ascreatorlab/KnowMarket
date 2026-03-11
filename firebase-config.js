/* ===== 🔐 FIREBASE CONFIG (firebase-config.js) ===== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA-WhbKSkuAx9S9sDcOZ-zWW84Pew29Z5E",
  authDomain: "knowmarket-bfdf7.firebaseapp.com",
  projectId: "knowmarket-bfdf7",
  storageBucket: "knowmarket-bfdf7.firebasestorage.app",
  messagingSenderId: "68118658961",
  appId: "1:68118658961:web:ea785bdaf3b0caa84da430"
};

// ✅ Initialize Firebase (with duplicate check)
let app, auth, provider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  console.log("🔐 Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase init error:", error.message);
}

// ✅ Global flag: Other scripts can check if Firebase is ready
window.firebaseReady = (app !== undefined);

// ✅ Safe DOM Update Helper (waits for DOM if needed)
function safeDOMUpdate(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

// ✅ Global Login Function (Accessible from HTML)
window.googleLogin = function() {
  if (!auth) {
    alert("⚠️ Firebase not initialized. Please wait 2 seconds and try again.");
    return;  }
  
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      updateProfileUI(user);
      console.log("✅ Login successful:", user.displayName);
    })
    .catch((error) => {
      console.error("❌ Login error:", error.code, error.message);
      
      // ✅ Handle common errors gracefully
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          // User cancelled - no alert needed
          break;
        case 'auth/unauthorized-domain':
          alert("❌ Domain not authorized. Add localhost to Firebase Console > Authorized Domains");
          break;
        case 'auth/network-request-failed':
          alert("⚠️ Network error. Please check your internet connection.");
          break;
        default:
          alert("Login failed: " + error.message);
      }
    });
};

// ✅ Global Logout Function
window.logout = function() {
  if (!auth) return;
  
  signOut(auth).then(() => {
    safeDOMUpdate(() => {
      const userName = document.getElementById("userName");
      const profileDetails = document.getElementById("profileDetails");
      const loginBtn = document.getElementById("googleLoginBtn");
      
      if (userName) userName.innerText = "";
      if (userEmail) userEmail.innerText = "";
      if (profileDetails) profileDetails.classList.add("hidden");
      if (loginBtn) loginBtn.style.display = "flex"; // Show login button again
      
      console.log("✅ Logged out");
    });
  }).catch((error) => {
    console.error("❌ Logout error:", error.message);
  });
};
// ✅ Update Profile UI when user logs in
function updateProfileUI(user) {
  safeDOMUpdate(() => {
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const profileDetails = document.getElementById("profileDetails");
    const loginBtn = document.getElementById("googleLoginBtn");
    
    if (userName) {
      userName.innerText = `Welcome, ${user.displayName} 🎉`;
    }
    if (userEmail) {
      userEmail.innerText = user.email;
    }
    if (profileDetails) {
      profileDetails.classList.remove("hidden");
    }
    if (loginBtn) {
      loginBtn.style.display = "none";
    }
    
    console.log("👤 Profile updated for:", user.email);
  });
}

// ✅ Listen for auth state changes (persists login across page reloads)
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateProfileUI(user);
    // ✅ Optional: Dispatch custom event for other scripts to listen
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
  } else {
    // ✅ User logged out - reset UI
    safeDOMUpdate(() => {
      const userName = document.getElementById("userName");
      const profileDetails = document.getElementById("profileDetails");
      const loginBtn = document.getElementById("googleLoginBtn");
      
      if (userName) userName.innerText = "";
      if (userEmail) userEmail.innerText = "";
      if (profileDetails) profileDetails.classList.add("hidden");
      if (loginBtn) loginBtn.style.display = "flex";
    });
  }
});

// ✅ Expose auth object for advanced use (optional)
window.knowMarketAuth = { auth, provider };

console.log("🔐 Firebase config loaded | Ready for login");
