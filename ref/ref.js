/**
 * SECURE SESSION MANAGEMENT SYSTEM
 * Uses sessionStorage with multiple protection layers
 */

// ======================
// SECURITY CONFIGURATION
// ======================
const SECURITY = {
  SESSION_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  TOKEN_LENGTH: 64,
  STORAGE_KEYS: {
    EMAIL: 'sec_email',
    TOKEN: 'sec_token',
    CSRF: 'sec_csrf',
    TIMESTAMP: 'sec_time',
    VERIFIED: 'sec_verified'
  }
};

// ======================
// CORE SECURITY FUNCTIONS
// ======================

/**
 * Generates cryptographically secure tokens
 */
function generateSecureToken(length = SECURITY.TOKEN_LENGTH) {
  const array = new Uint8Array(length / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Validates email format (basic check)
 */
function isValidEmail(email) {
  return typeof email === 'string' && 
         email.includes('@') && 
         email.length > 5 && 
         email.indexOf('@') < email.lastIndexOf('.');
}

/**
 * Initializes a secure session
 */
function initSecureSession(email) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Clear any existing session
  clearSession();

  // Generate new tokens
  const tokens = {
    email: email,
    sessionToken: generateSecureToken(),
    csrfToken: generateSecureToken(),
    timestamp: Date.now()
  };

  // Store in sessionStorage
  sessionStorage.setItem(SECURITY.STORAGE_KEYS.EMAIL, tokens.email);
  sessionStorage.setItem(SECURITY.STORAGE_KEYS.TOKEN, tokens.sessionToken);
  sessionStorage.setItem(SECURITY.STORAGE_KEYS.CSRF, tokens.csrfToken);
  sessionStorage.setItem(SECURITY.STORAGE_KEYS.TIMESTAMP, tokens.timestamp.toString());

  return tokens;
}

/**
 * Validates existing session
 */
function validateSession() {
  const email = sessionStorage.getItem(SECURITY.STORAGE_KEYS.EMAIL);
  const token = sessionStorage.getItem(SECURITY.STORAGE_KEYS.TOKEN);
  const csrf = sessionStorage.getItem(SECURITY.STORAGE_KEYS.CSRF);
  const timestamp = parseInt(sessionStorage.getItem(SECURITY.STORAGE_KEYS.TIMESTAMP) || '0');



  // Check if all required items exist
  if (!email || !token || !csrf) {
    return { valid: false, reason: 'Session data missing' };
  }

  // Check session age
  const age = Date.now() - timestamp;
  if (age > SECURITY.SESSION_TIMEOUT) {
    clearSession();
    return { valid: false, reason: 'Session expired' };
  }

  return { 
    valid: true, 
    email, 
    token, 
    csrf,
    age 
  };
}

/**
 * Clears session data securely
 */
function clearSession() {
  Object.values(SECURITY.STORAGE_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
}

// ======================
// BOT PROTECTION LAYERS
// ======================

/**
 * Basic bot detection
 */
function detectBotPatterns() {
  // Check for automation tools in user agent
  const botPatterns = [
    /HeadlessChrome/i,
    /PhantomJS/i,
    /Puppeteer/i,
    /Selenium/i,
    /WebDriver/i,
    /bot/i,
    /crawl/i,
    /spider/i
  ];

  return botPatterns.some(pattern => 
    navigator.userAgent.match(pattern)
  );
}

/**
 * Behavioral check
 */
function performBehavioralCheck() {
  // Check for headless browser signs
  if (window.outerWidth === 0 && window.outerHeight === 0) return false;
  
  // Check if important APIs are available
  try {
    if (!window.crypto || !window.crypto.getRandomValues) return false;
    if (!window.sessionStorage) return false;
  } catch (e) {
    return false;
  }
  
  return true;
}

// ======================
// MAIN VERIFICATION FLOW
// ======================

/**
 * Handles the verification process
 */
async function onVerify() {
  try {
    // Initial checks
    if (!performBehavioralCheck() || detectBotPatterns()) {
      throw new Error('Security verification failed');
    }

    // Verify reCAPTCHA
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      throw new Error('Please complete the reCAPTCHA verification');
    }

    // Validate session
    const session = validateSession();
    if (!session.valid) {
      throw new Error(session.reason || 'Invalid session');
    }

    // Mark as verified
    sessionStorage.setItem(SECURITY.STORAGE_KEYS.VERIFIED, 'true');

    // Prepare redirect URL
    const redirectUrl = new URL('pdf/adb.html', window.location.href);
    redirectUrl.hash = `email=${encodeURIComponent(session.email)}` +
                      `&token=${session.token}` +
                      `&csrf=${session.csrf}` +
                      `&time=${session.timestamp}`;

    // Secure redirect
    clearSession(); // Clear before redirect
    window.location.href = redirectUrl.toString();

  } catch (error) {
    console.error('Verification Error:', error);
    alert(`Security Error: ${error.message}`);
    grecaptcha.reset();
    clearSession();
  }
}

// ======================
// PAGE LOAD HANDLER
// ======================

/**
 * Handles page initialization
 */
window.onload = function() {
  // Enforce HTTPS
  if (window.location.protocol !== 'https:' && 
      !window.location.hostname.match(/localhost|127\.0\.0\.1/)) {
    window.location.href = `https://${window.location.host}${window.location.pathname}`;
    return;
  }

  // Process hash if present
  const hash = window.location.hash.substring(1);
  if (hash && isValidEmail(hash)) {
    try {
      initSecureSession(hash);
      history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      console.error('Session Initialization Failed:', error);
      window.location.href = '/error.html?code=session_error';
    }
  }
};
