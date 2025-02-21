'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { loginFetch } from '@/helpers/loginFetch';
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { CompletedOffer, OfferStatus } from "@/types/offer";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

interface Rating {
  rating: number;
  comment: string;
  name: string;
  profileImage?: string;
  logo?: string;
}

interface CompletedOffer {
  _id: string;
  title: string;
  description: string;
  status: string;
  completedAt: string;
  ugcRating: Rating;
  entrepriseRating: Rating;
}

export default function CompletedOffers() {
  const [offers, setOffers] = useState<CompletedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<{ [key: string]: number }>({});
  const [comment, setComment] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompletedOffers = async () => {
      try {
        const data = await loginFetch('/api/offers/completed');
        setOffers(data);
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/entreprise/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOffers();
  }, [router]);

  const handleRatingSubmit = async (offerId: string, ugcId: string) => {
    if (!rating[offerId] || !comment[offerId]) {
      setError('Veuillez donner une note et un commentaire');
      return;
    }

    setSubmitting(offerId);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          ugcId,
          rating: rating[offerId],
          comment: comment[offerId],
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la note');
      }

      // Mettre à jour l'état local
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer._id === offerId
            ? {
                ...offer,
                ugcRating: {
                  rating: rating[offerId],
                  comment: comment[offerId],
                  createdAt: new Date().toISOString(),
                },
              }
            : offer
        )
      );

      // Réinitialiser les champs
      setRating(prev => ({ ...prev, [offerId]: 0 }));
      setComment(prev => ({ ...prev, [offerId]: '' }));
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la soumission de la note');
    } finally {
      setSubmitting(null);
    }
  };

  const RatingDisplay = ({ rating }: { rating: Rating }) => (
    <div className="flex items-center mb-4">
      <img 
        src={rating.profileImage || rating.logo} 
        alt={`Photo de ${rating.name}`}
        className="w-10 h-10 rounded-full mr-4 object-cover"
      />
      <div>
        <h4 className="text-lg font-semibold">{rating.name}</h4>
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`text-xl ${
                index < rating.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-gray-600">{rating.comment}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex items-center mb-6">
          <Link href="/entreprise/offers" className="mr-4">
            <button className="bg-gray-200 rounded-full p-2">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Offres Complétées
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {offers.map((offer) => (
            <div key={offer._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {offer.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {offer.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Complétée le: {new Date(offer.completedAt).toLocaleDateString()}
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Évaluations
                  </h3>
                  {offer.ugcRating && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">UGC:</h4>
                      <RatingDisplay rating={offer.ugcRating} />
                    </div>
                  )}
                  {offer.entrepriseRating && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Entreprise:</h4>
                      <RatingDisplay rating={offer.entrepriseRating} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Aucune offre complétée pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
} 