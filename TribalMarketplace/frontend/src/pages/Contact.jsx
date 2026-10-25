// pages/Contact.jsx
// Contact page: "Meet Our Team" (components/TeamSection.jsx) and the contact form below it.
// Queries are saved in MongoDB (no email is sent); the team reads them on the
// SellerTribe Team page (Customer Queries), calls or emails the customer and marks them resolved.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../services/api.js';
import TeamSection from '../components/TeamSection.jsx';
import LeafOrnament from '../components/LeafOrnament.jsx';
import { CheckIcon, ListIcon, MailIcon, MessageIcon, PhoneIcon, SendIcon, UserIcon } from '../components/Icons.jsx';
import siteConfig from '../data/siteConfig.js';
import pageHeaderPhotos, { headerPhotoStyle } from '../data/pageHeaderPhotos.js';
import '../styles/contact.css';

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// Choices in the Subject list (the team sees the chosen one on the Customer Queries page)
const SUBJECTS = [
  'Question about a product',
  'Order or delivery',
  'Selling on Tribal Marketplace',
  'Account or login help',
  'Feedback or suggestion',
  'Something else',
];

// "+91 98765-43210" -> "9876543210" (the backend does the same)
function cleanMobileNumber(value) {
  return value
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?91(?=\d{10}$)/, '')
    .replace(/^0(?=\d{10}$)/, '');
}

function validateContact(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address';
  const phone = cleanMobileNumber(values.phone);
  if (!phone) errors.phone = 'Please enter your mobile number';
  else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Please enter a valid 10-digit mobile number';
  if (values.subject.trim().length < 3) errors.subject = 'Please choose a subject';
  if (values.message.trim().length < 10) errors.message = 'Please write a message (at least 10 characters)';
  if (values.message.length > 2000) errors.message = 'Message must be at most 2000 characters';
  return errors;
}

// One form field: a round icon on the left; label, box, hint and error on the right
function ContactField({ icon: FieldIcon, id, label, hint, error, wide = false, children }) {
  return (
    <div className={`contact-field ${wide ? 'contact-field-wide' : ''}`}>
      <span className="contact-field-icon" aria-hidden="true">
        <FieldIcon size={20} />
      </span>
      <div className="contact-field-body">
        <label htmlFor={id} className="form-label">
          {label} <span className="required">*</span>
        </label>
        {children}
        {hint && <p className="form-hint">{hint}</p>}
        {error && <p className="form-error">{error}</p>}
      </div>
    </div>
  );
}

function Contact() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formErrors = validateContact(values);
    setErrors(formErrors);
    setServerError('');
    setSuccessMessage('');
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      const data = await contactAPI.sendMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: cleanMobileNumber(values.phone),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      // Only show success after the backend confirms the message was saved
      setSuccessMessage(data.message);
      setValues(EMPTY_FORM);
    } catch (error) {
      setServerError(error.message);
      setErrors(error.errors || {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-page">
      <section className="page-header page-header-photo" style={headerPhotoStyle(pageHeaderPhotos.contact)}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Contact</span>
          </nav>
          <h1>Get in Touch</h1>
          <p>Meet the people behind Tribal Marketplace, or send us a message about a product, an order or selling with us.</p>
        </div>
      </section>

      <div className="container page-section contact-content">
        <TeamSection />

        <section className="contact-form-box" aria-labelledby="contact-form-title">
          <div className="ornament-heading">
            <LeafOrnament side="left" />
            <h2 id="contact-form-title">Contact Us</h2>
            <LeafOrnament side="right" />
          </div>
          {siteConfig.contactEmail && (
            <p className="contact-email-note">
              You can also email us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
            </p>
          )}

          {successMessage && (
            <div className="alert alert-success" role="status">
              <CheckIcon size={18} /> {successMessage}
            </div>
          )}
          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <ContactField icon={UserIcon} id="contact-name" label="Full Name" error={errors.name}>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                placeholder="Enter your full name"
                className={`form-control ${errors.name ? 'has-error' : ''}`}
                value={values.name}
                onChange={handleChange}
                maxLength={60}
              />
            </ContactField>

            <ContactField icon={MailIcon} id="contact-email" label="Email" error={errors.email}>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                className={`form-control ${errors.email ? 'has-error' : ''}`}
                value={values.email}
                onChange={handleChange}
                maxLength={100}
              />
            </ContactField>

            <ContactField
              icon={PhoneIcon}
              id="contact-phone"
              label="Mobile Number"
              hint="Our team may call you on this number to help with your query."
              error={errors.phone}
            >
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                className={`form-control ${errors.phone ? 'has-error' : ''}`}
                value={values.phone}
                onChange={handleChange}
                maxLength={15}
              />
            </ContactField>

            <ContactField icon={ListIcon} id="contact-subject" label="Subject" error={errors.subject}>
              <select
                id="contact-subject"
                name="subject"
                className={`form-control ${errors.subject ? 'has-error' : ''} ${values.subject ? '' : 'is-empty'}`}
                value={values.subject}
                onChange={handleChange}
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </ContactField>

            <ContactField
              icon={MessageIcon}
              id="contact-message"
              label="Message"
              hint={`${values.message.length} / 2000 characters`}
              error={errors.message}
              wide
            >
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                placeholder="Write your message here..."
                className={`form-control ${errors.message ? 'has-error' : ''}`}
                value={values.message}
                onChange={handleChange}
                maxLength={2000}
              />
            </ContactField>

            <div className="contact-form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                <SendIcon size={18} /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Contact;
