"use client";
import React, { useEffect, useState } from "react";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import Image from "next/image";
import { OfferStatus } from "@/types/offer";

interface Offer {
  _id: string;
  name: string;
  description: string;
  category: string;
  reward: string;
  code: string;
  status: OfferStatus;
  createdAt: string;
  completedAt?: string;
  ugcRating?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  entrepriseRating?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  candidatures?: Array<{
    _id: string;
    ugcId: string;
    status: string;
    createdAt: string;
    ugcInfo: {
      code: string;
      _id: string;
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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch(`/api/offer?id=${params.id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'offre");
        }
        const data = await response.json();
        setOffer(data);
        if (data.entrepriseRating) {
          setRating(data.entrepriseRating.rating);
          setComment(data.entrepriseRating.comment);
        }
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

  const handleSubmitRating = async () => {
    if (!offer) {
      console.error('No offer data available');
      return;
    }
    
    const acceptedCandidature = offer.candidatures?.find(c => c.status === 'accepted');
    console.log('Found accepted candidature:', acceptedCandidature);
    
    if (!acceptedCandidature || !acceptedCandidature.ugcId) {
      console.error('Invalid candidature data:', {
        exists: !!acceptedCandidature,
        hasUgcId: !!acceptedCandidature?.ugcId
      });
      setError('Impossible de trouver les informations du UGC');
      return;
    }

    setSubmittingRating(true);
    try {
      const requestData = {
        offerId: offer._id,
        toId: acceptedCandidature.ugcId,
        rating,
        comment,
        type: 'ugc'
      };
      
      console.log('Sending rating request with data:', requestData);

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response from server:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la soumission de la note');
      }

      // Mettre à jour l'état local
      setOffer(prev => prev ? {
        ...prev,
        entrepriseRating: {
          rating,
          comment,
          createdAt: new Date().toISOString()
        }
      } : null);

      // Clear the form after successful submission
      setRating(0);
      setComment('');
      setError(null);

    } catch (error) {
      console.error('Erreur détaillée:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la soumission de la note');
    } finally {
      setSubmittingRating(false);
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

  const acceptedCandidature = offer.candidatures?.find(c => c.status === 'accepted');

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

            {/* Section de notation pour les offres complétées */}
            {offer.status === OfferStatus.COMPLETED && acceptedCandidature && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  UGC ayant réalisé l&apos;offre
                </h3>
                <div className="flex items-center mb-6">
                  <div className="relative w-12 h-12 mr-4">
                    <Image
                      src={acceptedCandidature.ugcInfo.profileImage}
                      alt={`Photo de ${acceptedCandidature.ugcInfo.name}`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{acceptedCandidature.ugcInfo.name}</h4>
                    <p className="text-gray-600">{acceptedCandidature.ugcInfo.title}</p>
                  </div>
                </div>

                {offer.ugcRating && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Note de l&apos;UGC :</h4>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, index) => (
                        <FontAwesomeIcon
                          key={index}
                          icon={index < offer.ugcRating!.rating ? faStarSolid : faStarRegular}
                          className="text-yellow-400 mr-1"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{offer.ugcRating.comment}</p>
                  </div>
                )}

                {!offer.entrepriseRating && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Évaluer l&apos;UGC :</h4>
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setRating(index + 1)}
                          className="focus:outline-none"
                        >
                          <FontAwesomeIcon
                            icon={index < rating ? faStarSolid : faStarRegular}
                            className="text-yellow-400 text-xl mr-1"
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Laissez un commentaire..."
                      className="w-full p-2 border rounded-md mb-4"
                      rows={4}
                    />
                    <button
                      onClick={handleSubmitRating}
                      disabled={submittingRating || rating === 0 || !comment}
                      style={{ backgroundColor: "#90579F" }}
                      className="px-4 py-2 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {submittingRating ? 'Envoi...' : 'Envoyer la note'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Affichage des candidatures */}
            {offer.candidatures && offer.candidatures.length > 0 && offer.status !== OfferStatus.COMPLETED && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Candidatures ({offer.candidatures.length})
                </h3>
                <div className="space-y-4">
                  {offer.candidatures.map((candidature) => (
                    <div key={candidature._id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="relative w-12 h-12 mr-4">
                        <Image
                          src={candidature.ugcInfo.profileImage}
                          alt={`Photo de ${candidature.ugcInfo.name}`}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
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
                            <Link href={`/ugc/profile/${candidature.ugcInfo._id}`} className="flex items-center space-x-4">
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