export const loginFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token"); // Récupère le token depuis localStorage

    if (!token) {
        console.error("Token JWT manquant. Redirection nécessaire.");
        throw new Error("Utilisateur non authentifié.");
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`, // Ajoute le token dans l'en-tête
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        return await response.json(); // Retourne les données JSON
    } catch (error) {
        console.error("Erreur dans loginFetch :", error.message);
        throw error;
    }
};
