'use client';

import { faBell, faHeart, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import NotificationsList from './NotificationsList';
import logo from './logo.png';

const redirect = () => {
  window.location.href = '/';
};

const TopBar = () => {
  const [path, setPath] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPath(window.location.pathname);
    fetchUnreadCount();

    // Mettre à jour le nombre de notifications non lues toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du nombre de notifications');
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de notifications:', err);
    }
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  return (
    <div
      className="sticky top-0 left-0 right-0 text-white px-8 flex items-center justify-between h-20 w-full z-10"
      style={{ background: 'linear-gradient(to right, #182F53, #90579F)' }}
    >
      <Image
        src={logo}
        alt="LOGO"
        className="absolute left-8 filter invert"
        width={100}
        height={40}
        style={{ objectFit: 'contain', width: 'auto', height: '40px' }}
        onClick={redirect}
      />
      <div className="ml-auto flex space-x-4">
        {path.startsWith('/ugc') && (
          <Link href="/construction">
            <span className="text-2xl">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </Link>
        )}
        <Link href="/construction">
          <span className="text-2xl">
            <FontAwesomeIcon icon={faHeart} />
          </span>
        </Link>
        <div className="relative">
          <span
            ref={buttonRef}
            onClick={toggleNotifications}
            className="text-2xl cursor-pointer relative"
          >
            <FontAwesomeIcon icon={faBell} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
          <div ref={menuRef}>
            <NotificationsList isOpen={notificationsOpen} onClose={closeNotifications} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
