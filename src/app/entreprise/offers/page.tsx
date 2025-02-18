"use client";
import React, { useEffect, useState, useCallback } from "react";
import "../../globals.css";
import Image from "next/image";
import Navbar from "../../components/navbar";
import TopBar from "../../components/topBar";
import { useAuth } from "@/hooks/useAuth"; // Importe le hook personnalisé
import { loginFetch } from "@/helpers/loginFetch";
import Link from "next/link";

const App = () => {
    useAuth(); // Vérifie si l'utilisateur est connecté

    interface Offer {
        name: string;
        category: string;
        description: string;
        reward: string;
        code: string;
        createdAt: string;
        entrepriseId: string;
        archived: boolean;
    }

    const [offers, setOffers] = useState<Offer[]>([]);
    const [archivedOffers, setArchivedOffers] = useState<Offer[]>([]);

    const loadOffers = useCallback(async () => {
        try {
            const dataOffres = await loginFetch(`/api/offers`);
            console.log('Offres rechargées:', dataOffres);
            setOffers(dataOffres);
        } catch (error) {
            console.error("Erreur lors de la récupération des offres :", error);
        }
    }, []);

    // Chargement initial des offres
    useEffect(() => {
        loadOffers();
    }, [loadOffers]);

    // Fonction pour formater le temps écoulé
    const formatTimeElapsed = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        return `Il y a ${diffDays} jours`;
    };

    return (
        <div>
            <TopBar />
            <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-gray-900 text-xl font-bold">
                        Vos annonces en ligne
                    </h3>
                    <Link 
                        href={{
                            pathname: "/entreprise/offers/new",
                            query: { reloadOffers: "true" }
                        }}
                    >
                        <button
                            style={{ backgroundColor: "#90579F" }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Créer une nouvelle offre
                        </button>
                    </Link>
                </div>
                <ul
                    role="list"
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full"
                >
                    {Array.isArray(offers) && offers.length > 0 ? (
                        offers.map((offer, index) => (
                            <div
                                key={offer.code}
                                className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                                            {offer.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatTimeElapsed(offer.createdAt)}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-gray-400">{offer.category}</div>
                                    <div className="mt-2 text-sm text-gray-500">{offer.description}</div>
                                    <div className="mt-2 font-semibold text-purple-600">{offer.reward}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <h3>Vous n&apos;avez pas d&apos;annonces en ligne</h3>
                    )}
                </ul>
            </div>
            <Navbar />
        </div>
    );
};

export default App;
