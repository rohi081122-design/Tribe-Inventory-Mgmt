// components/AdminQueries.jsx
// Team page -> Customer Queries: questions sent from the marketplace Contact Us page.
// - Pending queries are shown first (newest first). Each one shows the customer's name,
//   mobile number (tap to call), email (tap to write), subject, message and date.
// - "View full query" opens all the details; "Mark as Resolved" saves the new status in MongoDB
//   and the query leaves the Pending list at once. Resolved queries are kept (see the Resolved tab)
//   and can be moved back to Pending if they were resolved by mistake.

import { useEffect, useRef, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import Loading from './Loading.jsx';
import photoIcons from '../data/photoIcons.js';
import { CheckIcon, CloseIcon, MailIcon, PhoneIcon, UserIcon } from './Icons.jsx';
import { adminAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDateTime, formatPhone } from '../utils/format.js';

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All queries' },
];

// tel: link that opens the phone dialer (numbers are saved as 10 Indian digits)
const phoneLink = (phone) => `tel:+91${phone}`;

// mailto: link with the subject and a greeting already filled in
function emailLink(query) {
  const subject = encodeURIComponent(`Re: ${query.subject}`);
  const body = encodeURIComponent(`Namaste ${query.name},\n\nThank you for contacting Tribal Marketplace.\n\n`);
  return `mailto:${query.email}?subject=${subject}&body=${body}`;
}

function StatusPill({ status }) {
  return (
    <span className={`query-status query-status-${status}`}>{status === 'resolved' ? 'Resolved' : 'Pending'}</span>
  );
}

// Pop-up with every detail of one query (built on <dialog>, which handles focus and Escape)
function QueryDetails({ query, busy, onClose, onResolve, onReopen }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (query && dialog && !dialog.open) dialog.showModal();
    if (!query && dialog?.open) dialog.close();
  }, [query]);

  return (
    <dialog
      ref={dialogRef}
      className="query-dialog"
      aria-labelledby="query-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {query && (
        <>
          <div className="query-dialog-header">
            <div>
              <StatusPill status={query.status} />
              <h2 id="query-dialog-title">{query.subject}</h2>
            </div>
            <button type="button" className="query-dialog-close" onClick={onClose} aria-label="Close">
              <CloseIcon size={20} />
            </button>
          </div>

          <dl className="query-details">
            <div>
              <dt>Customer</dt>
              <dd>{query.name}</dd>
            </div>
            <div>
              <dt>Mobile number</dt>
              <dd>
                {query.phone ? (
                  <a href={phoneLink(query.phone)} className="query-contact">
                    <PhoneIcon size={16} /> {formatPhone(query.phone)}
                  </a>
                ) : (
                  <span className="text-muted">Not given (older message)</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={emailLink(query)} className="query-contact">
                  <MailIcon size={16} /> {query.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Sent on</dt>
              <dd>{formatDateTime(query.createdAt)}</dd>
            </div>
            {query.status === 'resolved' && query.resolvedAt && (
              <div>
                <dt>Resolved on</dt>
                <dd>{formatDateTime(query.resolvedAt)}</dd>
              </div>
            )}
          </dl>

          <h3 className="query-dialog-subtitle">Message</h3>
          <p className="query-full-message">{query.message}</p>

          <div className="query-dialog-actions">
            {query.phone && (
              <a href={phoneLink(query.phone)} className="btn btn-outline">
                <PhoneIcon size={16} /> Call
              </a>
            )}
            <a href={emailLink(query)} className="btn btn-outline">
              <MailIcon size={16} /> Send email
            </a>
            {query.status === 'resolved' ? (
              <button type="button" className="btn btn-outline" onClick={() => onReopen(query)} disabled={busy}>
                Move back to Pending
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => onResolve(query)} disabled={busy}>
                <CheckIcon size={16} /> {busy ? 'Saving...' : 'Mark as Resolved'}
              </button>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}

// onPendingChange(count) tells the Admin page how many queries are pending (for the tab badge)
function AdminQueries({ onSessionExpired, onPendingChange }) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState('pending');
  const [queries, setQueries] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, resolved: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [openQuery, setOpenQuery] = useState(null);

  // Load the queries of the chosen tab (newest first)
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    adminAPI
      .getQueries(filter)
      .then((data) => {
        if (ignore) return;
        setQueries(data.queries);
        setCounts(data.counts);
        onPendingChange?.(data.counts.pending);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) onSessionExpired();
        setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [filter, onSessionExpired, onPendingChange]);

  // Resolve (or reopen) a query: saved in MongoDB, then the list updates without reloading
  async function changeStatus(query, resolve) {
    setBusyId(query._id);
    try {
      const data = resolve ? await adminAPI.resolveQuery(query._id) : await adminAPI.reopenQuery(query._id);
      setCounts(data.counts);
      onPendingChange?.(data.counts.pending);
      if (filter === 'all') {
        setQueries((list) => list.map((item) => (item._id === query._id ? data.query : item)));
        setOpenQuery((current) => (current?._id === query._id ? data.query : current));
      } else {
        // It no longer belongs to this list (Pending or Resolved)
        setQueries((list) => list.filter((item) => item._id !== query._id));
        setOpenQuery(null);
      }
      showToast(data.message, 'success');
    } catch (err) {
      if (err.status === 401) onSessionExpired();
      showToast(err.message, 'error');
    } finally {
      setBusyId('');
    }
  }

  return (
    <>
      <div className="admin-tabs" role="tablist" aria-label="Filter customer queries">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            className={`chip ${filter === item.value ? 'is-active' : ''}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label} <span className="chip-count">{counts[item.value]}</span>
          </button>
        ))}
      </div>

      {loading && <Loading text="Loading customer queries..." />}
      {!loading && error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && queries.length === 0 && (
        <EmptyState
          photo={photoIcons.womenGroup}
          title={filter === 'pending' ? 'No pending queries' : filter === 'resolved' ? 'No resolved queries yet' : 'No queries yet'}
          message={
            filter === 'pending'
              ? 'All customer queries are resolved. New questions from the Contact Us page will appear here.'
              : 'Questions sent from the marketplace Contact Us page appear here.'
          }
        />
      )}

      {!loading && !error && queries.length > 0 && (
        <ul className="query-list">
          {queries.map((query) => (
            <li key={query._id} className={`query-card ${query.status === 'resolved' ? 'is-resolved' : ''}`}>
              <div className="query-card-header">
                <div>
                  <h3 className="query-subject">{query.subject}</h3>
                  <small>Sent {formatDateTime(query.createdAt)}</small>
                </div>
                <StatusPill status={query.status} />
              </div>

              <div className="query-customer">
                <span className="query-customer-name">
                  <UserIcon size={16} /> {query.name}
                </span>
                {query.phone ? (
                  <a href={phoneLink(query.phone)} className="query-contact" title="Call the customer">
                    <PhoneIcon size={16} /> {formatPhone(query.phone)}
                  </a>
                ) : (
                  <span className="text-muted">No mobile number</span>
                )}
                <a href={emailLink(query)} className="query-contact" title="Email the customer">
                  <MailIcon size={16} /> {query.email}
                </a>
              </div>

              <p className="query-message">{query.message}</p>

              <div className="query-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpenQuery(query)}>
                  View full query
                </button>
                {query.status === 'resolved' ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => changeStatus(query, false)}
                    disabled={busyId === query._id}
                  >
                    Move back to Pending
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => changeStatus(query, true)}
                    disabled={busyId === query._id}
                  >
                    <CheckIcon size={16} /> {busyId === query._id ? 'Saving...' : 'Mark as Resolved'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <QueryDetails
        query={openQuery}
        busy={Boolean(openQuery && busyId === openQuery._id)}
        onClose={() => setOpenQuery(null)}
        onResolve={(query) => changeStatus(query, true)}
        onReopen={(query) => changeStatus(query, false)}
      />
    </>
  );
}

export default AdminQueries;
