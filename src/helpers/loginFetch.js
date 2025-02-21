export const loginFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token JWT manquant. Redirection nécessaire.");
        throw new Error("Utilisateur non authentifié.");
    }

    const headers = {
        ...options.headers,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include" // Pour envoyer les cookies
        });

        if (!response.ok) {
            // Si le token est invalide ou expiré, on nettoie le localStorage
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                // Rediriger vers la page de connexion appropriée
                const currentPath = window.location.pathname;
                if (currentPath.startsWith("/entreprise")) {
                    window.location.href = "/entreprise/login";
                } else if (currentPath.startsWith("/ugc")) {
                    window.location.href = "/ugc/login";
                }
            }
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur dans loginFetch :", error.message);
        throw error;
    }
};
