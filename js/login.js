import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyAdGdyPObmRyJ-dtl6-llbVMJr4uYgBWlw",
  authDomain: "tripmate-74df9.firebaseapp.com",
  databaseURL: "https://tripmate-74df9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tripmate-74df9",
  storageBucket: "tripmate-74df9.firebasestorage.app",
  messagingSenderId: "931960941543",
  appId: "1:931960941543:web:ced98c012dc22fcb776b42"
};
const firebaseAuth = getAuth(initializeApp(firebaseConfig));

// ================= CONFIG =================
// In production this MUST be an HTTPS URL (browsers block HTTP calls from HTTPS pages)
// and the backend must allow your website domain in CORS.
const API_BASE_URL = "http://15.235.145.222:10000/";
const HOME_URL = "home.html";          // dummy home screen (replace with index.html when ready)
const REGISTER_URL = "register.html";
const PHONE_CHECK_URL = "auth/check-user";
const LOGIN_URL = "auth/login-password";
const SEND_OTP_URL = "auth/forgot-password/send-otp";
const VERIFY_OTP_URL = "auth/forgot-password/verify-otp";

// ================= ELEMENTS / STATE =================
const $ = id => document.getElementById(id);
const phone = $("phone"), password = $("password"), mainButton = $("mainButton");
const passwordGroup = $("passwordGroup"), forgotRow = $("forgotRow"), resetSection = $("resetSection");
let userExists = false, loading = false, forgotMode = false, otpSent = false, redirecting = false;
let otpSessionId = "", otpTimer = null, otpSeconds = 0;

// Already signed in -> go straight to home
onAuthStateChanged(firebaseAuth, user => {
  if (user && !loading && !redirecting) location.replace(HOME_URL);
});

// ================= LANGUAGE =================
const translations = {
  en: { welcome: "Welcome to Tripride", mobile: "Mobile Number", phoneHint: "Enter 10 digit mobile number", password: "Password", passwordHint: "Enter your password", continue: "Continue →", login: "Login →", forgot: "Forgot Password?", reset: "Reset your password", send: "Send OTP", verify: "Verify OTP & Update Password", back: "← Back to Login", invalid: "Enter a valid 10 digit mobile number" },
  te: { welcome: "ట్రిప్‌రైడ్‌కు స్వాగతం", mobile: "మొబైల్ నంబర్", phoneHint: "10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి", password: "పాస్‌వర్డ్", passwordHint: "మీ పాస్‌వర్డ్ నమోదు చేయండి", continue: "కొనసాగించండి →", login: "లాగిన్ →", forgot: "పాస్‌వర్డ్ మర్చిపోయారా?", reset: "పాస్‌వర్డ్ రీసెట్ చేయండి", send: "OTP పంపండి", verify: "OTP నిర్ధారించి పాస్‌వర్డ్ మార్చండి", back: "← లాగిన్‌కు తిరిగి వెళ్లండి", invalid: "సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి" },
  hi: { welcome: "Tripride में आपका स्वागत है", mobile: "मोबाइल नंबर", phoneHint: "10 अंकों का मोबाइल नंबर दर्ज करें", password: "पासवर्ड", passwordHint: "अपना पासवर्ड दर्ज करें", continue: "जारी रखें →", login: "लॉगिन →", forgot: "पासवर्ड भूल गए?", reset: "पासवर्ड रीसेट करें", send: "OTP भेजें", verify: "OTP सत्यापित करें और पासवर्ड बदलें", back: "← लॉगिन पर वापस जाएं", invalid: "सही 10 अंकों का मोबाइल नंबर दर्ज करें" },
  ta: { welcome: "Tripride-க்கு வரவேற்கிறோம்", mobile: "மொபைல் எண்", phoneHint: "10 இலக்க மொபைல் எண்ணை உள்ளிடவும்", password: "கடவுச்சொல்", passwordHint: "கடவுச்சொல்லை உள்ளிடவும்", continue: "தொடரவும் →", login: "உள்நுழை →", forgot: "கடவுச்சொல் மறந்துவிட்டதா?", reset: "கடவுச்சொல்லை மீட்டமைக்கவும்", send: "OTP அனுப்பு", verify: "OTP சரிபார்த்து கடவுச்சொல்லை மாற்று", back: "← உள்நுழைவுக்குத் திரும்பு", invalid: "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்" },
  kn: { welcome: "Tripride ಗೆ ಸ್ವಾಗತ", mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", phoneHint: "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ", password: "ಪಾಸ್‌ವರ್ಡ್", passwordHint: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ", continue: "ಮುಂದುವರಿಸಿ →", login: "ಲಾಗಿನ್ →", forgot: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?", reset: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ", send: "OTP ಕಳುಹಿಸಿ", verify: "OTP ಪರಿಶೀಲಿಸಿ ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ", back: "← ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ", invalid: "ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ" },
  ml: { welcome: "Tripride-ലേക്ക് സ്വാഗതം", mobile: "മൊബൈൽ നമ്പർ", phoneHint: "10 അക്ക മൊബൈൽ നമ്പർ നൽകുക", password: "പാസ്‌വേഡ്", passwordHint: "പാസ്‌വേഡ് നൽകുക", continue: "തുടരുക →", login: "ലോഗിൻ →", forgot: "പാസ്‌വേഡ് മറന്നോ?", reset: "പാസ്‌വേഡ് പുനഃസജ്ജമാക്കുക", send: "OTP അയയ്ക്കുക", verify: "OTP പരിശോധിച്ച് പാസ്‌വേഡ് മാറ്റുക", back: "← ലോഗിനിലേക്ക് മടങ്ങുക", invalid: "ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക" }
};
const T = () => translations[$("language").value] || translations.en;

function applyLanguage() {
  const t = T();
  if (!userExists || forgotMode) $("heading").textContent = forgotMode ? t.reset : t.welcome;
  $("phoneLabel").textContent = t.mobile;
  phone.placeholder = t.phoneHint;
  $("passwordLabel").textContent = t.password;
  password.placeholder = t.passwordHint;
  $("forgotBtn").textContent = t.forgot;
  $("backLogin").textContent = t.back;
  mainButton.textContent = forgotMode ? (otpSent ? t.verify : t.send) : (userExists ? t.login : t.continue);
}
$("language").addEventListener("change", e => {
  localStorage.setItem("tripride_login_language", e.target.value);
  applyLanguage();
});
const savedLang = localStorage.getItem("tripride_login_language");
if (savedLang && translations[savedLang]) $("language").value = savedLang;
applyLanguage();

// ================= HELPERS =================
const normalisePhone = v => {
  let r = v.replace(/\D/g, "");
  if (r.startsWith("91") && r.length === 12) r = r.substring(2);
  return r;
};
const validMobile = n => /^[6-9]\d{9}$/.test(n);
const showError = m => { $("errorBox").textContent = m; $("errorBox").style.display = "block"; $("successBox").style.display = "none"; };
const showSuccess = m => { $("successBox").textContent = m; $("successBox").style.display = "block"; $("errorBox").style.display = "none"; };
const clearMessages = () => { $("errorBox").style.display = "none"; $("successBox").style.display = "none"; };

function setLoading(value) {
  loading = value;
  mainButton.disabled = value;
  if (value) mainButton.innerHTML = '<span class="spinner"></span>';
  else applyLanguage();
}

async function apiRequest(endpoint, data) {
  if (location.protocol === "https:" && API_BASE_URL.startsWith("http:")) {
    throw new Error("Server URL must use HTTPS. Browsers block HTTP calls from an HTTPS page.");
  }
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data),
      signal: ctrl.signal
    });
    let body = {};
    try { body = await response.json(); } catch (_) {}
    if (!response.ok || body.success !== true) {
      throw new Error(body.message || body.error || "Something went wrong. Please try again.");
    }
    return body;
  } catch (e) {
    console.error("API ERROR:", endpoint, e);
    if (e.name === "AbortError") throw new Error("Request timed out. Please try again.");
    if (e instanceof TypeError) throw new Error("Cannot reach server (network/CORS error). Please try again.");
    throw e;
  } finally { clearTimeout(timer); }
}

phone.addEventListener("input", () => {
  phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
  clearMessages();
});

// ================= STEP 1: CHECK MOBILE =================
async function checkMobile() {
  const number = normalisePhone(phone.value);
  if (!validMobile(number)) return showError(T().invalid);
  clearMessages();
  setLoading(true);
  try {
    const result = await apiRequest(PHONE_CHECK_URL, { phone: number });
    userExists = result.exists === true || result.user_exists === true || result.registered === true;
    if (userExists) {
      passwordGroup.classList.remove("hidden");
      forgotRow.classList.remove("hidden");
      $("editPhone").classList.remove("hidden");
      phone.readOnly = true;
      $("heading").textContent = "Welcome Back!";
      $("subtitle").textContent = "Your mobile number is registered. Enter your password.";
      password.focus();
    } else {
      showSuccess("No account found. Redirecting to signup page...");
      setTimeout(() => { location.href = REGISTER_URL + "?phone=" + encodeURIComponent(number); }, 1000);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

// ================= STEP 2: PASSWORD + FIREBASE =================
async function loginWithPassword() {
  const number = normalisePhone(phone.value), pass = password.value;
  if (!validMobile(number)) return showError(T().invalid);
  if (!pass.trim()) { showError("Please enter your password."); password.focus(); return; }

  clearMessages();
  setLoading(true);
  try {
    // 1. Backend verifies mobile + password
    const result = await apiRequest(LOGIN_URL, { phone: number, password: pass });

    // 2. Firebase custom token from backend
    const customToken = String(result.custom_token || result.customToken || result.token || result.firebase_token || "").trim();
    if (!customToken) throw new Error("Firebase authentication token was not returned by server.");

    // 3. Firebase session
    redirecting = true;
    const credential = await signInWithCustomToken(firebaseAuth, customToken);
    if (!credential.user) throw new Error("Firebase user session was not created.");

    // 4. Non-secret info only
    localStorage.setItem("userId", credential.user.uid);
    localStorage.setItem("userPhone", number);
    password.value = "";

    showSuccess("Login successful! Welcome to Tripride.");
    setTimeout(() => location.replace(HOME_URL), 700);   // 5. Home screen
  } catch (error) {
    redirecting = false;
    console.error("LOGIN ERROR:", error);
    const bad = ["auth/invalid-custom-token", "auth/custom-token-mismatch"];
    showError(bad.includes(error.code) ? "Login session could not be created. Please try again." : (error.message || "Unable to login."));
  } finally {
    if (redirecting) { loading = true; } else setLoading(false);
  }
}

// ================= MAIN BUTTON / KEYS =================
mainButton.addEventListener("click", async () => {
  if (loading) return;
  if (forgotMode) return otpSent ? verifyForgotOtp() : sendForgotOtp();
  return userExists ? loginWithPassword() : checkMobile();
});
phone.addEventListener("keydown", e => { if (e.key === "Enter") { userExists ? password.focus() : checkMobile(); } });
password.addEventListener("keydown", e => { if (e.key === "Enter" && !loading) loginWithPassword(); });

$("editPhone").addEventListener("click", () => {
  userExists = false;
  passwordGroup.classList.add("hidden");
  forgotRow.classList.add("hidden");
  $("editPhone").classList.add("hidden");
  phone.readOnly = false;
  password.value = "";
  $("heading").textContent = T().welcome;
  $("subtitle").textContent = "Enter your mobile number to continue your journey.";
  clearMessages();
  applyLanguage();
  phone.focus();
});

$("togglePassword").addEventListener("click", () => {
  const visible = password.type === "text";
  password.type = visible ? "password" : "text";
  $("togglePassword").setAttribute("aria-label", visible ? "Show password" : "Hide password");
});
const toggleInput = id => { const i = $(id); i.type = i.type === "password" ? "text" : "password"; };
$("toggleNewPassword").addEventListener("click", () => toggleInput("newPassword"));
$("toggleConfirmPassword").addEventListener("click", () => toggleInput("confirmPassword"));

// ================= FORGOT PASSWORD =================
$("forgotBtn").addEventListener("click", () => {
  forgotMode = true; otpSent = false; otpSessionId = "";
  passwordGroup.classList.add("hidden");
  forgotRow.classList.add("hidden");
  resetSection.classList.remove("hidden");
  $("backLogin").classList.remove("hidden");
  $("subtitle").textContent = "Create a new password for your Tripride account.";
  ["newPassword", "confirmPassword", "otp"].forEach(i => $(i).value = "");
  $("otpGroup").classList.add("hidden");
  clearMessages();
  applyLanguage();
});

async function sendForgotOtp() {
  const number = normalisePhone(phone.value), newPass = $("newPassword").value, confirmPass = $("confirmPassword").value;
  if (!validMobile(number)) return showError("Enter your registered 10 digit mobile number.");
  if (newPass.length < 6) return showError("Password must be at least 6 characters.");
  if (newPass !== confirmPass) return showError("Passwords do not match.");
  clearMessages();
  setLoading(true);
  try {
    const result = await apiRequest(SEND_OTP_URL, { phone: number });
    otpSessionId = String(result.session_id || result.sessionId || "").trim();
    if (!otpSessionId) throw new Error("OTP session was not returned by server.");
    otpSent = true;
    $("otpGroup").classList.remove("hidden");
    $("otp").focus();
    startOtpTimer();
    showSuccess("OTP sent to your registered mobile number.");
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

function startOtpTimer() {
  clearInterval(otpTimer);
  otpSeconds = 60;
  updateTimer();
  $("resendOtp").disabled = true;
  otpTimer = setInterval(() => {
    otpSeconds--;
    updateTimer();
    if (otpSeconds <= 0) { clearInterval(otpTimer); $("resendOtp").disabled = false; }
  }, 1000);
}
const updateTimer = () => { $("timer").textContent = otpSeconds > 0 ? `Resend in ${otpSeconds}s` : "You can resend OTP"; };

$("resendOtp").addEventListener("click", async () => {
  if (otpSeconds > 0 || loading) return;
  await sendForgotOtp();
});

async function verifyForgotOtp() {
  const number = normalisePhone(phone.value), otp = $("otp").value.trim();
  const newPass = $("newPassword").value, confirmPass = $("confirmPassword").value;
  if (!otpSessionId) return showError("OTP session is missing. Please send OTP again.");
  if (otp.length < 4) return showError("Enter the OTP sent to your mobile number.");
  if (newPass.length < 6 || newPass !== confirmPass) return showError("Please enter matching valid passwords.");
  clearMessages();
  setLoading(true);
  try {
    await apiRequest(VERIFY_OTP_URL, {
      phone: number, otp,
      session_id: otpSessionId, sessionId: otpSessionId,
      new_password: newPass, password: newPass, confirm_password: confirmPass,
      phone_verified_by: "backend"
    });
    leaveForgotMode();
    password.value = "";
    $("heading").textContent = "Password Updated";
    $("subtitle").textContent = "Your password has been changed successfully.";
    showSuccess("Password updated successfully. Please login with your new password.");
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

function leaveForgotMode() {
  clearInterval(otpTimer);
  forgotMode = false; otpSent = false; otpSessionId = "";
  resetSection.classList.add("hidden");
  $("backLogin").classList.add("hidden");
  passwordGroup.classList.remove("hidden");
  forgotRow.classList.remove("hidden");
  ["newPassword", "confirmPassword", "otp"].forEach(i => $(i).value = "");
}

$("backLogin").addEventListener("click", () => {
  leaveForgotMode();
  clearMessages();
  $("heading").textContent = "Welcome Back!";
  $("subtitle").textContent = "Enter your password to continue.";
  applyLanguage();
});

phone.focus();
