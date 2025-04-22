import {
  faCalendar,
  faChartLine,
  faHome,
  faMessage,
  faSearch,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { jwtDecode } from 'jwt-decode';

import { useEffect, useState } from 'react';

import Link from 'next/link';

interface CustomJwtPayload {
  userId: string;
  type: string;
  iat?: number;
  exp?: number;
}

export default function Navbar() {
  const [path, setPath] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setPath(window.location.pathname);
    // Récupérer l'userId depuis le localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Protection contre les valeurs null/undefined
  const profileLink = userId
    ? path.startsWith('/ugc')
      ? `/ugc/profile/${userId}`
      : `/entreprise/profile/${userId}`
    : path.startsWith('/ugc')
      ? '/ugc/profile/edit'
      : '/entreprise/profile/edit';

  if (path.startsWith('/ugc')) {
    return (
      <div
        className="fixed z-50 h-20 w-full bottom-0 overflow-hidden"
        style={{
          background: 'linear-gradient(to right, #0D1828, rgb(88, 45, 100))',
        }}
      >
        <div className="max-w-screen-xl mx-auto h-full">
          <div className="flex h-full justify-evenly items-center">
            <Link href="/ugc/offers" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-4">
                <FontAwesomeIcon icon={faHome} />
              </span>
            </Link>

            <Link href="/ugc/calendar" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-4">
                <FontAwesomeIcon icon={faCalendar} />
              </span>
            </Link>

            <Link href="/construction" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-4">
                <FontAwesomeIcon icon={faMessage} />
              </span>
            </Link>

            <Link href={profileLink} className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-4">
                <FontAwesomeIcon icon={faUser} />
              </span>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-24 w-full text-center">
          <Link href="/mentions-legales" className="text-white text-sm hover:underline">
            Mentions légales
          </Link>
        </div>
      </div>
    );
  } else if (path.startsWith('/entreprise')) {
    return (
      <div
        className="fixed z-50 h-20 w-full bottom-0 overflow-hidden"
        style={{
          background: 'linear-gradient(to right, #0D1828, rgb(88, 45, 100))',
        }}
      >
        <div className="max-w-screen-xl mx-auto h-full">
          <div className="flex h-full justify-evenly items-center">
            <Link href="/entreprise/offers" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-3">
                <FontAwesomeIcon icon={faHome} />
              </span>
            </Link>

            <Link href="/entreprise/calendar" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-3">
                <FontAwesomeIcon icon={faCalendar} />
              </span>
            </Link>

            <Link href="/construction" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-3">
                <FontAwesomeIcon icon={faChartLine} />
              </span>
            </Link>

            <Link href="/construction" className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-3">
                <FontAwesomeIcon icon={faMessage} />
              </span>
            </Link>

            <Link href={profileLink} className="flex items-center justify-center h-full">
              <span className="icon text-3xl text-white px-3">
                <FontAwesomeIcon icon={faUser} />
              </span>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-24 w-full text-center">
          <Link href="/mentions-legales" className="text-white text-sm hover:underline">
            Mentions légales
          </Link>
        </div>
      </div>
    );
  }
}
