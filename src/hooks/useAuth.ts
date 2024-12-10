import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Utilisateur non authentifié. Redirection.");
            router.push("/entreprise/login");
        }
    }, [router]);
};
