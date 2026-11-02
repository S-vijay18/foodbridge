import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Info, Package, Truck, HeartHandshake } from 'lucide-react';
import { NotificationItem, NotificationType } from '../types';
import { api } from '../services/api';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      const countData = await api.getUnreadCount();
      setUnreadCount(countData.unread_count);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'DONATION_NEW':
        return <Package size={16} className="text-emerald-600" />;
      case 'REQUEST_RECEIVED':
      case 'REQUEST_APPROVED':
        return <HeartHandshake size={16} className="text-blue-600" />;
      case 'DELIVERY_ASSIGNED':
      case 'DELIVERY_STATUS_CHANGE':
        return <Truck size={16} className="text-amber-600" />;
      default:
        return <Info size={16} className="text-purple-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-800 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-3 ${
                    !notif.is_read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="p-2 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!notif.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

