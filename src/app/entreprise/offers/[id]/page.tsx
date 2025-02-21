"use client";
import React, { useEffect, useState } from "react";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUsers } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface Offer {
  _id: string;
  name: string;
  description: string;
  category: string;
  reward: string;
  code: string;
  createdAt: string;
  candidatures?: Array<{
    _id: string;
    status: string;
    createdAt: string;
    ugcInfo: {
      code: string;
      name: string;
      profileImage: string;
      title: string;
    };
  }>;
}

export default function OfferDetails({ params }: { params: { id: string } }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const handleUpdateStatus = async (candidatureId: string, newStatus: 'accepted' | 'rejected') => {
    setUpdating(candidatureId);
    try {
      const response = await fetch('/api/candidatures/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidatureId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour l'état local
      setOffer(prevOffer => {
        if (!prevOffer) return null;
        return {
          ...prevOffer,
          candidatures: prevOffer.candidatures?.map(candidature =>
            candidature._id === candidatureId
              ? { ...candidature, status: newStatus }
              : candidature
          )
        };
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

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

            {/* Affichage des candidatures */}
            {offer.candidatures && offer.candidatures.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Candidatures ({offer.candidatures.length})
                </h3>
                <div className="space-y-4">
                  {offer.candidatures.map((candidature) => (
                    <div key={candidature._id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <img
                        src={candidature.ugcInfo.profileImage}
                        alt={`Photo de ${candidature.ugcInfo.name}`}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{candidature.ugcInfo.name}</h4>
                            <p className="text-gray-600">{candidature.ugcInfo.title}</p>
                            <p className="text-sm text-gray-500">
                              Candidature envoyée le {new Date(candidature.createdAt).toLocaleDateString()}
                            </p>
                            <span className={`inline-block px-2 py-1 text-sm rounded mt-2 ${
                              candidature.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              candidature.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {candidature.status === 'pending' ? 'En attente' :
                               candidature.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/ugc/profile/${candidature.ugcInfo.code}`}>
                              <button
                                style={{ backgroundColor: "#90579F" }}
                                className="px-3 py-1 text-white text-sm rounded hover:bg-purple-700 transition-colors duration-200"
                              >
                                Voir le profil
                              </button>
                            </Link>
                            {candidature.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(candidature._id, 'accepted')}
                                  disabled={updating === candidature._id}
                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                                >
                                  {updating === candidature._id ? 'En cours...' : 'Accepter'}
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(candidature._id, 'rejected')}
                                  disabled={updating === candidature._id}
                                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                                >
                                  {updating === candidature._id ? 'En cours...' : 'Refuser'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
} 