import { jwtDecode } from 'jwt-decode';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

interface JwtPayload {
  userId: string;
  type: string;
  exp?: number;
}

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const currentPath = window.location.pathname;

        if (!token) {
          console.error('Token manquant. Redirection vers la page de connexion.');
          if (currentPath.startsWith('/entreprise')) {
            router.push('/entreprise/login');
          } else if (currentPath.startsWith('/ugc')) {
            router.push('/ugc/login');
          }
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);

        // Vérifier si le token est expiré
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.error('Token expiré. Redirection vers la page de connexion.');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          if (currentPath.startsWith('/entreprise')) {
            router.push('/entreprise/login');
          } else if (currentPath.startsWith('/ugc')) {
            router.push('/ugc/login');
          }
          return;
        }

        // Vérifier le type d'utilisateur
        if (currentPath.startsWith('/entreprise') && decoded.type !== 'entreprise') {
          console.error(
            "Type d'utilisateur incorrect. Redirection vers la page de connexion entreprise."
          );
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/entreprise/login');
        } else if (currentPath.startsWith('/ugc') && decoded.type !== 'ugc') {
          console.error("Type d'utilisateur incorrect. Redirection vers la page de connexion UGC.");
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/ugc/login');
        }
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/entreprise')) {
          router.push('/entreprise/login');
        } else if (currentPath.startsWith('/ugc')) {
          router.push('/ugc/login');
        }
      }
    };

    checkAuth();
  }, [router]);
};
