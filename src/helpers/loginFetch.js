export const loginFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Utilisateur non authentifié.");
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur dans loginFetch :", error);
        throw error;
    }
};
