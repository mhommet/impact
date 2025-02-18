"use client";
import React, { useEffect, useState } from "react";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUsers } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface Offer {
  name: string;
  description: string;
  category: string;
  reward: string;
  code: string;
  createdAt: string;
}

export default function OfferDetails({ params }: { params: { id: string } }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch(`/api/offer?id=${params.id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'offre");
        }
        const data = await response.json();
        setOffer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Offre non trouvée</p>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/entreprise/offers" className="mr-4">
              <button className="bg-gray-200 rounded-full p-2">
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Détails de l&apos;offre
            </h1>
          </div>
          <Link href={`/entreprise/offers/${params.id}/candidatures`}>
            <button
              style={{ backgroundColor: "#90579F" }}
              className="flex items-center px-4 py-2 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Voir les candidatures
            </button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {offer.name}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {offer.category.split(" ").map((word, index) => (
                  <span
                    key={index}
                    style={{ backgroundColor: "#90579F" }}
                    className="text-white px-3 py-1 rounded-full text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-purple-600 font-semibold mb-4">
                {offer.reward}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {offer.description}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Publiée le {new Date(offer.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
} 