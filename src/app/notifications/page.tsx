'use client';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Notification } from '@/types/notification';

import Navbar from '../components/navbar';
import TopBar from '../components/topBar';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
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

      // Mettre à jour le compteur de notifications non lues
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

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

      // Mettre à jour le compteur de notifications non lues
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id!);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const timeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
    if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }
    if (diffInMins > 0) {
      return `il y a ${diffInMins} minute${diffInMins > 1 ? 's' : ''}`;
    }
    return "à l'instant";
  };

  return (
    <>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-24">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="bg-gray-200 rounded-full p-2 mr-4">
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>

        {unreadCount > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <div className="text-purple-600 font-medium">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue
              {unreadCount > 1 ? 's' : ''}
            </div>
            <button
              onClick={markAllAsRead}
              className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            >
              Tout marquer comme lu
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Chargement des notifications...</p>
          </div>
        ) : error ? (
          <div className="p-4 mt-4 bg-red-100 text-red-700 rounded-md">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="bg-gray-100 rounded-full p-6 inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="mt-4 text-gray-600">Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                  notification.read ? 'bg-white' : 'bg-blue-50'
                } hover:bg-gray-50`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {timeAgo(new Date(notification.createdAt))}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="ml-4 mt-1">
                      <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </>
  );
};

export default NotificationsPage;
