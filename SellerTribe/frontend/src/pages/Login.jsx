// pages/Login.jsx
// Seller login and registration on one page.
//   /login                -> Login with contact number OR Aadhaar number
//   /login?mode=register  -> Register with name, contact number, Aadhaar number and address
//
// ⚠️ Prototype: there is no password or OTP yet (see backend/controllers/authController.js).

import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CheckIcon, InfoIcon } from '../components/Icons.jsx';
import '../styles/auth.css';

const EMPTY_REGISTRATION = { name: '', phone: '', aadhaar: '', village: '', district: '', state: 'Jharkhand' };

// "+91 98765-43210" -> "9876543210"
function onlyDigits(text) {
  return text.replace(/[\s-]/g, '').replace(/^\+91/, '');
}

// Browser-side checks for the registration form (the backend checks again)
function validateRegistration(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!/^\d{10}$/.test(onlyDigits(values.phone))) errors.phone = 'Please enter a 10-digit contact number';
  if (!/^\d{12}$/.test(onlyDigits(values.aadhaar))) errors.aadhaar = 'Please enter your 12-digit Aadhaar number';
  if (values.village.trim().length < 2) errors.village = 'Please enter your village or town';
  if (values.district.trim().length < 2) errors.district = 'Please enter your district';
  if (values.state.trim().length < 2) errors.state = 'Please enter your state';
  return errors;
}

function Login() {
  const { seller, login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectTo = location.state?.from || '/';

  const [identifier, setIdentifier] = useState('');
  const [registration, setRegistration] = useState(EMPTY_REGISTRATION);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go to the dashboard.
  if (seller && !submitting) {
    return <Navigate to={redirectTo} replace />;
  }

  function switchMode(newMode) {
    setSearchParams(newMode === 'register' ? { mode: 'register' } : {}, { replace: true });
    setErrors({});
    setServerError('');
    setNotRegistered(false);
  }

  /* ----- Login ----- */

  async function handleLogin(event) {
    event.preventDefault();
    if (submitting) return;

    const digits = onlyDigits(identifier);
    if (!/^(\d{10}|\d{12})$/.test(digits)) {
      setErrors({ identifier: 'Enter your 10-digit contact number or your 12-digit Aadhaar number' });
      return;
    }

    setErrors({});
    setServerError('');
    setNotRegistered(false);
    setSubmitting(true);
    try {
      const data = await login(digits);
      showToast(data.message);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
      setNotRegistered(error.status === 404);
      setSubmitting(false);
    }
  }

  // "Register now" after a failed login: copy the number into the right registration field
  function registerWithTypedNumber() {
    const digits = onlyDigits(identifier);
    setRegistration((current) => ({
      ...current,
      phone: digits.length === 10 ? digits : current.phone,
      aadhaar: digits.length === 12 ? digits : current.aadhaar,
    }));
    switchMode('register');
  }

  /* ----- Registration ----- */

  function handleRegistrationChange(event) {
    const { name, value } = event.target;
    setRegistration((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleRegister(event) {
    event.preventDefault();
    if (submitting) return;

    const formErrors = validateRegistration(registration);
    setErrors(formErrors);
    setServerError('');
    if (Object.keys(formErrors).length > 0) {
      setServerError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await register({
        name: registration.name.trim(),
        phone: onlyDigits(registration.phone),
        aadhaar: onlyDigits(registration.aadhaar),
        village: registration.village.trim(),
        district: registration.district.trim(),
        state: registration.state.trim(),
      });
      showToast(data.message);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message);
      setErrors(error.errors || {});
      setSubmitting(false);
    }
  }

  // Small helper so every registration field looks the same
  function renderField(name, label, { placeholder, inputMode, maxLength, autoComplete, hint } = {}) {
    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label} <span className="required">*</span>
        </label>
        <input
          id={name}
          name={name}
          className={`form-control ${errors[name] ? 'has-error' : ''}`}
          value={registration[name]}
          onChange={handleRegistrationChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
        />
        {hint && <p className="form-hint">{hint}</p>}
        {errors[name] && <p className="form-error">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-aside">
          <span className="eyebrow">SellerTribe · Seller Hub</span>
          <h1>Sell your handmade products on Tribal Marketplace</h1>
          <ol className="auth-steps">
            <li>
              <strong>1</strong> Register with your name, contact number, Aadhaar and address
            </li>
            <li>
              <strong>2</strong> The Tribal Marketplace team checks and approves your account
            </li>
            <li>
              <strong>3</strong> Upload photos of your products - buyers see them right away
            </li>
          </ol>
        </aside>

        <div className="auth-form-wrapper">
          <div className="auth-tabs" role="tablist" aria-label="Login or register">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
              onClick={() => switchMode('register')}
            >
              New Seller? Register
            </button>
          </div>

          {serverError && (
            <div className="alert alert-error" role="alert">
              <span>
                {serverError}
                {notRegistered && (
                  <button type="button" className="link-button" onClick={registerWithTypedNumber}>
                    Register now
                  </button>
                )}
              </span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} noValidate className="auth-form">
              <h2 className="auth-title">Seller Login</h2>
              <p className="auth-subtitle">Enter the contact number or Aadhaar number you registered with.</p>

              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  Contact Number or Aadhaar Number
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  className={`form-control form-control-lg ${errors.identifier ? 'has-error' : ''}`}
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setErrors({});
                  }}
                  placeholder="e.g. 9876543210"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={16}
                />
                {errors.identifier && <p className="form-error">{errors.identifier}</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </button>

              <p className="prototype-note">
                <InfoIcon size={16} /> Demo version: no password or OTP yet. Use dummy numbers for testing.
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} noValidate className="auth-form">
              <h2 className="auth-title">Seller Registration</h2>
              <p className="auth-subtitle">Fields marked * are required.</p>

              {renderField('name', 'Full Name', { placeholder: 'e.g. Sunita Murmu', autoComplete: 'name' })}

              <div className="form-row">
                {renderField('phone', 'Contact Number', {
                  placeholder: '10-digit mobile number',
                  inputMode: 'numeric',
                  maxLength: 14,
                  autoComplete: 'tel',
                })}
                {renderField('aadhaar', 'Aadhaar Number', {
                  placeholder: '12-digit Aadhaar number',
                  inputMode: 'numeric',
                  maxLength: 14,
                  autoComplete: 'off',
                })}
              </div>

              <fieldset className="address-fieldset">
                <legend className="form-label">Address</legend>
                <div className="form-row form-row-3">
                  {renderField('village', 'Village / Town', { autoComplete: 'address-level3' })}
                  {renderField('district', 'District', { autoComplete: 'address-level2' })}
                  {renderField('state', 'State', { autoComplete: 'address-level1' })}
                </div>
              </fieldset>

              <p className="privacy-note">
                <CheckIcon size={16} /> Your Aadhaar number is stored in protected form and is never shown on the marketplace.
                After you register, our team will approve your account before you can upload products.
              </p>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register as Seller'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
