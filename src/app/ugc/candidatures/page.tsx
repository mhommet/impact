"use client";
import React, { useEffect, useState } from "react";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Image from "next/image";
import Link from "next/link";

interface Candidature {
  _id: string;
  offerCode: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  offerInfo: {
    name: string;
    category: string;
    description: string;
    reward: string;
    entrepriseInfo: {
      name: string;
      logo: string;
    };
  };
}

export default function MesCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        const response = await fetch('/api/candidatures/me');
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des candidatures");
        }
        const data = await response.json();
        setCandidatures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidatures();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return 'En attente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Mes candidatures
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {candidatures.map((candidature) => (
            <div
              key={candidature._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 mr-4">
                    <Image
                      src={candidature.offerInfo.entrepriseInfo.logo || "/img/default-company.png"}
                      alt={`Logo de ${candidature.offerInfo.entrepriseInfo.name}`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {candidature.offerInfo.name}
                    </h3>
                    <p className="text-gray-600">
                      {candidature.offerInfo.entrepriseInfo.name}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-600">{candidature.offerInfo.category}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {candidature.offerInfo.description.substring(0, 100)}...
                  </p>
                  <p className="text-purple-600 font-semibold mt-2">
                    {candidature.offerInfo.reward}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-sm font-medium ${getStatusColor(candidature.status)}`}>
                    {getStatusText(candidature.status)}
                  </span>
                  <Link href={`/ugc/offer/${candidature.offerCode}`}>
                    <button
                      style={{ backgroundColor: "#90579F" }}
                      className="text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                    >
                      Voir l&apos;offre
                    </button>
                  </Link>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Candidature envoyée le {new Date(candidature.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {candidatures.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                Vous n&apos;avez pas encore postulé à des offres.
              </p>
              <Link href="/ugc/offers">
                <button
                  style={{ backgroundColor: "#90579F" }}
                  className="text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 mt-4"
                >
                  Voir les offres disponibles
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
} 