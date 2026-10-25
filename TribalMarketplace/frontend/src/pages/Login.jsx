// pages/Login.jsx - buyer login (sellers log in on the SellerTribe website)

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CheckIcon, StoreIcon } from '../components/Icons.jsx';
import siteConfig from '../data/siteConfig.js';
import '../styles/auth.css';

function Login() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Page the user tried to open before being sent to login (set by ProtectedRoute)
  const redirectTo = location.state?.from || '';

  // Already logged in? Leave the login page.
  if (user && !submitting) {
    return <Navigate to={redirectTo || '/'} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formErrors = {};
    if (!values.email.trim()) formErrors.email = 'Please enter your email';
    if (!values.password) formErrors.password = 'Please enter your password';
    setErrors(formErrors);
    setServerError('');
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      const data = await login({ email: values.email.trim(), password: values.password });
      showToast(data.message || 'Logged in successfully.');
      navigate(redirectTo || '/', { replace: true });
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <aside className="auth-aside">
          <span className="eyebrow">Welcome back</span>
          <h2>Log in to Tribal Marketplace</h2>
          <p>Continue exploring handmade products from tribal artisans.</p>
          <ul className="auth-benefits">
            <li>
              <CheckIcon size={18} /> Explore handmade crafts from Jharkhand
            </li>
            <li>
              <CheckIcon size={18} /> Products listed directly by local sellers
            </li>
            <li>
              <CheckIcon size={18} /> Secure login with encrypted passwords
            </li>
          </ul>
        </aside>

        <div className="auth-form-wrapper">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Enter your email and password to continue.</p>

          {location.state?.from && (
            <div className="alert alert-info">Please log in (or create an account) to continue.</div>
          )}
          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-control ${errors.email ? 'has-error' : ''}`}
                value={values.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`form-control ${errors.password ? 'has-error' : ''}`}
                value={values.password}
                onChange={handleChange}
                placeholder="Your password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            New to Tribal Marketplace?{' '}
            <Link to="/register" state={redirectTo ? { from: redirectTo } : undefined}>
              Create an account
            </Link>
          </p>

          <a href={`${siteConfig.sellerSiteUrl}/login`} className="auth-seller-link">
            <StoreIcon size={18} /> Are you a seller? Log in on the seller website
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
