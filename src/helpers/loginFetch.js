export const loginFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token'); // Récupère le token depuis localStorage

  if (!token) {
    console.error('Token JWT manquant. Redirection nécessaire.');
    window.location.href = '/'; // Rediriger vers la page d'accueil pour se reconnecter
    throw new Error('Utilisateur non authentifié.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`, // Ajoute le token dans l'en-tête
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // S'assure que les cookies sont envoyés
    });

    if (!response.ok) {
      // Si nous avons une erreur 401 (non autorisé), le token est probablement expiré
      if (response.status === 401) {
        console.error('Session expirée. Redirection nécessaire.');
        localStorage.removeItem('token'); // Supprimer le token invalide
        window.location.href = '/'; // Rediriger vers la page d'accueil
      }
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    // Vérifier que la réponse contient du contenu avant de tenter de la parser
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json(); // Retourne les données JSON
    } else {
      return await response.text(); // Retourne le texte pour les autres types de contenu
    }
  } catch (error) {
    console.error('Erreur dans loginFetch :', error.message);
    throw error;
  }
};
