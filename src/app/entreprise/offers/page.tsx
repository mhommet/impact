"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Image from "next/image";
import Navbar from "../../components/navbar";
import TopBar from "../../components/topBar";
import { useAuth } from "@/hooks/useAuth";
import { loginFetch } from "@/helpers/loginFetch";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Offer, OfferStatus } from "@/types/offer";

const App = () => {
  useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token d'authentification manquant");
          router.push('/entreprise/login');
          return;
        }

        const data = await loginFetch('/api/offers');
        setOffers(data);
      } catch (err) {
        const error = err as Error;
        console.error('Erreur:', error);
        setError(error.message);
        if (error.message.includes('401') || error.message.includes('403')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/entreprise/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [router]);

  const handleUpdateStatus = async (offerId: string, newStatus: OfferStatus) => {
    setUpdating(offerId);
    try {
      const response = await fetch('/api/offers/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour l'état local
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer._id === offerId
            ? { ...offer, status: newStatus }
            : offer
        )
      );
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeClass = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.CREATED:
        return 'bg-blue-100 text-blue-800';
      case OfferStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case OfferStatus.PENDING_VALIDATION:
        return 'bg-purple-100 text-purple-800';
      case OfferStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.CREATED:
        return 'Créée';
      case OfferStatus.IN_PROGRESS:
        return 'En cours';
      case OfferStatus.PENDING_VALIDATION:
        return 'En attente de validation';
      case OfferStatus.COMPLETED:
        return 'Terminée';
      default:
        return status;
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

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {offer.name}
                  </h4>
                  <p className="text-gray-600">{offer.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-sm rounded-full ${getStatusBadgeClass(offer.status)}`}>
                      {getStatusText(offer.status)}
                    </span>
                    {offer.candidatures && (
                      <span className="text-sm text-gray-500">
                        {offer.candidatures.length} candidat(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/entreprise/offers/${offer._id}`}>
                    <button
                      style={{ backgroundColor: "#90579F" }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Voir les détails
                    </button>
                  </Link>
                  {offer.status === OfferStatus.IN_PROGRESS && (
                    <button
                      onClick={() => handleUpdateStatus(offer._id, OfferStatus.PENDING_VALIDATION)}
                      disabled={updating === offer._id}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      {updating === offer._id ? 'En cours...' : 'Demander validation'}
                    </button>
                  )}
                  {offer.status === OfferStatus.PENDING_VALIDATION && (
                    <button
                      onClick={() => handleUpdateStatus(offer._id, OfferStatus.COMPLETED)}
                      disabled={updating === offer._id}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {updating === offer._id ? 'En cours...' : 'Terminer'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Aucune offre active pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default App;
