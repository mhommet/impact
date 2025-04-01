import React, { useEffect, useState } from 'react';

import { Notification } from '@/types/notification';

import NotificationItem from './NotificationItem';

interface NotificationsListProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de la récupération des notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage de la notification comme lue');
      }

      // Mettre à jour l'état local
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all: true }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage de toutes les notifications comme lues');
      }

      // Mettre à jour l'état local
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })));
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden border border-gray-200">
      <div className="py-2 px-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-800"
            disabled={loading || notifications.every((n) => n.read)}
          >
            Tout marquer comme lu
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Aucune notification</div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </>
        )}
      </div>

      <div className="py-2 px-3 bg-gray-50 border-t border-gray-200">
        <a
          href="/notifications"
          className="text-xs text-blue-600 hover:text-blue-800 block text-center"
        >
          Voir toutes les notifications
        </a>
      </div>
    </div>
  );
};

export default NotificationsList;
