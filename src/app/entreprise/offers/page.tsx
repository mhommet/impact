'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Offer, OfferStatus } from '@/types/offer';

import { loginFetch } from '@/helpers/loginFetch';
import { useAuth } from '@/hooks/useAuth';

import Navbar from '../../components/navbar';
import TopBar from '../../components/topBar';
import '../../globals.css';

const App = () => {
  useAuth();
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [completedOffers, setCompletedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Token d'authentification manquant");
          router.push('/entreprise/login');
          return;
        }

        const data = await loginFetch('/api/offers');
        // Séparer les offres actives et complétées
        setActiveOffers(data.filter((offer: Offer) => offer.status !== OfferStatus.COMPLETED));
        setCompletedOffers(data.filter((offer: Offer) => offer.status === OfferStatus.COMPLETED));
        console.log(
          'Offres actives:',
          data.filter((offer: Offer) => offer.status !== OfferStatus.COMPLETED)
        );
        console.log(
          'Offres complétées:',
          data.filter((offer: Offer) => offer.status === OfferStatus.COMPLETED)
        );
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
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          offerId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour l'état local
      if (newStatus === OfferStatus.COMPLETED) {
        // Déplacer l'offre des actives vers les complétées
        setActiveOffers((prevOffers) => prevOffers.filter((offer) => offer._id !== offerId));
        setCompletedOffers((prevOffers) => [
          ...prevOffers,
          { ...activeOffers.find((o) => o._id === offerId)!, status: newStatus },
        ]);
      } else {
        setActiveOffers((prevOffers) =>
          prevOffers.map((offer) =>
            offer._id === offerId ? { ...offer, status: newStatus } : offer
          )
        );
      }
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

  const OfferCard = ({ offer }: { offer: Offer }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{offer.name}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {offer.category.split(' ').map((cat, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(offer.status)}`}>
            {getStatusText(offer.status)}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {offer.candidatesCount} candidature{offer.candidatesCount !== 1 && 's'}
          </span>
          <Link href={`/entreprise/offers/${offer._id}`}>
            <button
              style={{ backgroundColor: '#90579F' }}
              className="px-4 py-2 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
            >
              Voir les détails
            </button>
          </Link>
        </div>

        {offer.status === OfferStatus.COMPLETED && offer.ugcInfo && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Réalisée par :</p>
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3">
                <Image
                  src={offer.ugcInfo.profileImage}
                  alt={`Photo de ${offer.ugcInfo.name}`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{offer.ugcInfo.name}</p>
                <p className="text-sm text-gray-600">{offer.ugcInfo.title}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vos annonces en ligne</h1>
          <Link href="/entreprise/offers/new">
            <button
              style={{ backgroundColor: '#90579F' }}
              className="flex items-center px-4 py-2 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nouvelle annonce
            </button>
          </Link>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activeOffers.map((offer) => (
            <OfferCard key={offer._id} offer={offer} />
          ))}
          {activeOffers.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Aucune annonce active pour le moment.
            </div>
          )}
        </div>

        {completedOffers.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos offres passées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedOffers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          </>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default App;
