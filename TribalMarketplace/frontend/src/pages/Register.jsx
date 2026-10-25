// pages/Register.jsx
// Create a buyer account. (Sellers register on the separate SellerTribe website.)

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CheckIcon, StoreIcon } from '../components/Icons.jsx';
import siteConfig from '../data/siteConfig.js';
import '../styles/auth.css';

const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// Browser-side checks (the backend repeats all of them)
function validateRegistration(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address';
  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (values.password.length > 72) errors.password = 'Password must be at most 72 characters';
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';
  if (values.village.trim().length < 2) errors.village = 'Please enter your village or town';
  if (values.district.trim().length < 2) errors.district = 'Please enter your district';
  if (values.state.trim().length < 2) errors.state = 'Please enter your state';
  return errors;
}

function Register() {
  const { user, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Page the user wanted before registering (for example the checkout), passed on from the login page
  const redirectTo = location.state?.from || '/';

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    village: '',
    district: '',
    state: 'Jharkhand',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go to the homepage.
  if (user && !submitting) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formErrors = validateRegistration(values);
    setErrors(formErrors);
    setServerError('');
    if (Object.keys(formErrors).length > 0) {
      setServerError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await register({ ...values, name: values.name.trim(), email: values.email.trim() });
      showToast(data.message || 'Account created successfully.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message);
      setErrors(error.errors || {});
      setSubmitting(false);
    }
  }

  // Small helper so every text field looks the same
  function renderField(name, label, { type = 'text', autoComplete, placeholder } = {}) {
    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label} <span className="required">*</span>
        </label>
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`form-control ${errors[name] ? 'has-error' : ''}`}
          value={values[name]}
          onChange={handleChange}
        />
        {errors[name] && <p className="form-error">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <aside className="auth-aside">
          <span className="eyebrow">Join the community</span>
          <h2>Discover tribal crafts and art</h2>
          <p>Create an account to explore handmade products from tribal artisans of Jharkhand.</p>
          <ul className="auth-benefits">
            <li>
              <CheckIcon size={18} /> Free to register
            </li>
            <li>
              <CheckIcon size={18} /> Handmade products from local sellers
            </li>
            <li>
              <CheckIcon size={18} /> Your password is stored encrypted
            </li>
          </ul>
        </aside>

        <div className="auth-form-wrapper">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Fields marked * are required.</p>

          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {renderField('name', 'Full Name', { autoComplete: 'name', placeholder: 'e.g. Ravi Kumar' })}
            {renderField('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}

            <div className="form-row">
              {renderField('password', 'Password', {
                type: 'password',
                autoComplete: 'new-password',
                placeholder: 'At least 8 characters',
              })}
              {renderField('confirmPassword', 'Confirm Password', {
                type: 'password',
                autoComplete: 'new-password',
                placeholder: 'Type it again',
              })}
            </div>

            <div className="form-row form-row-3">
              {renderField('village', 'Village / Town', { autoComplete: 'address-level3' })}
              {renderField('district', 'District', { autoComplete: 'address-level2' })}
              {renderField('state', 'State', { autoComplete: 'address-level1' })}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" state={redirectTo !== '/' ? { from: redirectTo } : undefined}>
              Log in
            </Link>
          </p>

          <a href={`${siteConfig.sellerSiteUrl}/login?mode=register`} className="auth-seller-link">
            <StoreIcon size={18} /> Are you an artisan or seller? Register on the seller website
          </a>
        </div>
      </div>
    </div>
  );
}

export default Register;
