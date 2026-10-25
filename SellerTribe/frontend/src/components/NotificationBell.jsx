// components/NotificationBell.jsx
// Bell in the navbar with the number of unread notifications ("New order: keep 3 x Dokra Horse ready").
// - asks the server for new notifications every 30 seconds (only while the page is visible)
// - shows a toast when a new one arrives, and tells open pages to load the latest orders
// - clicking a notification marks it as read and opens the Orders page

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, CloseIcon, PackageIcon } from './Icons.jsx';
import { notificationAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatTimeAgo } from '../utils/format.js';
import { NEW_NOTIFICATIONS_EVENT } from '../utils/orders.js';

const CHECK_EVERY_MS = 30 * 1000;

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const lastUnreadCount = useRef(null); // null = not loaded yet (no toast for the first load)
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationAPI.getMine();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      // Something new arrived since the last check
      if (lastUnreadCount.current !== null && data.unreadCount > lastUnreadCount.current) {
        showToast(data.notifications[0]?.title || 'You have a new notification', 'info');
        window.dispatchEvent(new Event(NEW_NOTIFICATIONS_EVENT));
      }
      lastUnreadCount.current = data.unreadCount;
    } catch {
      // Server not reachable right now - try again at the next check
    }
  }, [showToast]);

  // Load now, then check again every 30 seconds
  useEffect(() => {
    loadNotifications();
    const timerId = setInterval(() => {
      if (document.visibilityState === 'visible') loadNotifications();
    }, CHECK_EVERY_MS);
    return () => clearInterval(timerId);
  }, [loadNotifications]);

  // Close the list when clicking outside it or pressing Escape
  useEffect(() => {
    if (!open) return undefined;
    function handleClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function rememberUnread(count) {
    setUnreadCount(count);
    lastUnreadCount.current = count;
  }

  async function openNotification(notification) {
    setOpen(false);
    if (!notification.isRead) {
      setNotifications((list) => list.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)));
      try {
        const data = await notificationAPI.markRead(notification._id);
        rememberUnread(data.unreadCount);
      } catch {
        // not important - it stays unread
      }
    }
    navigate('/orders');
  }

  async function markAllAsRead() {
    try {
      await notificationAPI.markAllRead();
      setNotifications((list) => list.map((item) => ({ ...item, isRead: true })));
      rememberUnread(0);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <div className="notification-bell" ref={wrapperRef}>
      <button
        type="button"
        className="seller-nav-link notification-button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        title="Notifications"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className="notification-count" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel" role="dialog" aria-label="Notifications">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-empty">
              No notifications yet. When a buyer orders one of your products, you will see here how many to keep ready.
            </p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification._id}>
                  <button
                    type="button"
                    className={`notification-item ${notification.isRead ? '' : 'is-unread'}`}
                    onClick={() => openNotification(notification)}
                  >
                    <span className={`notification-icon notification-icon-${notification.type}`} aria-hidden="true">
                      {notification.type === 'order_cancelled' ? <CloseIcon size={16} /> : <PackageIcon size={16} />}
                    </span>
                    <span className="notification-text">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>{formatTimeAgo(notification.createdAt)}</small>
                    </span>
                    {!notification.isRead && <span className="visually-hidden">(unread)</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link to="/orders" className="notification-footer" onClick={() => setOpen(false)}>
            See all orders
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
