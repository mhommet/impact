"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Image from "next/image";
import Navbar from "../../components/navbar";
import TopBar from "../../components/topBar";
import { useAuth } from "@/hooks/useAuth"; // Importe le hook personnalisé
import { loginFetch } from "@/helpers/loginFetch";

const App = () => {
    useAuth(); // Vérifie si l'utilisateur est connecté

    interface Offer {
        title: string;
        type: string;
    }

    const [offers, setOffers] = useState<Offer[]>([]);
    const [archivedOffers, setArchivedOffers] = useState<Offer[]>([]);

    // Fetching offers
    useEffect(() => {
        const fetchEntreprise = async () => {
            try {
                const dataOffres = await loginFetch(`/api/offersentreprise?id=1`);
                const dataArchivedOffres = await loginFetch(
                    `/api/offersentreprise?id=1&archived=true`
                );

                setOffers(dataOffres);
                setArchivedOffers(dataArchivedOffres);
            } catch (error) {
                console.error("Erreur lors de la récupération des offres :", error);
            }
        };

        fetchEntreprise();
    }, []);

    return (
        <div>
            <TopBar />
            <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
                <h3 className="text-gray-900 text-xl font-bold">
                    Vos annonces en ligne
                </h3>
                <ul
                    role="list"
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full"
                >
                    {Array.isArray(offers) && offers.length > 0 ? (
                        offers.map((offer, index) => (
                            <div
                                key={index}
                                className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full"
                            >
                                <div className="p-8">
                                    <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                                        {offer.title}
                                    </div>
                                    <div className="mt-2 text-gray-400">{offer.type}</div>
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
