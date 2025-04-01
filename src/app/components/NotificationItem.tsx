import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
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

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <Link
      href={notification.actionUrl || '#'}
      className={`flex items-start p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        {notification.imageUrl ? (
          <Image
            src={notification.imageUrl}
            alt=""
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold text-sm text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600">{notification.message}</p>
        <span className="text-xs text-gray-500 mt-1 block">
          {timeAgo(new Date(notification.createdAt))}
        </span>
      </div>
      {!notification.read && (
        <div className="ml-2 flex-shrink-0">
          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
        </div>
      )}
    </Link>
  );
};

export default NotificationItem;
