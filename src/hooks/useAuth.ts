import { jwtDecode } from 'jwt-decode';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

interface JwtPayload {
  userId: string;
  type: string;
  exp?: number;
}

export interface AuthState {
  userId: string | null;
  userType: string | null;
  isLoading: boolean;
}

export const useAuth = (): AuthState => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Vérifier si nous sommes dans un environnement avec localStorage (côté client)
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return { userId: null, userType: null, isLoading: false };
        }

        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        const currentPath = window.location.pathname;

        // Si nous avons déjà un userId stocké, utilisons-le immédiatement
        if (storedUserId) {
          setUserId(storedUserId);
        }

        if (!token) {
          console.error('Token manquant. Redirection vers la page de connexion.');
          if (currentPath.startsWith('/entreprise')) {
            router.push('/entreprise/login');
          } else if (currentPath.startsWith('/ugc')) {
            router.push('/ugc/login');
          }
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);

        // Mettre à jour les états avec les informations du token
        setUserId(decoded.userId);
        setUserType(decoded.type);

        // S'assurer que userId est également dans localStorage pour compatibilité
        localStorage.setItem('userId', decoded.userId);

        // Vérifier si le token est expiré
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.error('Token expiré. Redirection vers la page de connexion.');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUserId(null);
          setUserType(null);
          if (currentPath.startsWith('/entreprise')) {
            router.push('/entreprise/login');
          } else if (currentPath.startsWith('/ugc')) {
            router.push('/ugc/login');
          }
          setIsLoading(false);
          return;
        }

        // Vérifier le type d'utilisateur
        if (currentPath.startsWith('/entreprise') && decoded.type !== 'entreprise') {
          console.error(
            "Type d'utilisateur incorrect. Redirection vers la page de connexion entreprise."
          );
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUserId(null);
          setUserType(null);
          router.push('/entreprise/login');
        } else if (currentPath.startsWith('/ugc') && decoded.type !== 'ugc') {
          console.error("Type d'utilisateur incorrect. Redirection vers la page de connexion UGC.");
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUserId(null);
          setUserType(null);
          router.push('/ugc/login');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setUserId(null);
        setUserType(null);
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/entreprise')) {
          router.push('/entreprise/login');
        } else if (currentPath.startsWith('/ugc')) {
          router.push('/ugc/login');
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { userId, userType, isLoading };
};
