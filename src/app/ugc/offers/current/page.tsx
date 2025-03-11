'use client';

import { faArrowLeft, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

import Navbar from '../../../components/navbar';
import TopBar from '../../../components/topBar';
import '../../../globals.css';

interface Media {
  _id: string;
  type: 'image' | 'video';
  url: string;
  description?: string;
  createdAt: string;
}

interface Offer {
  _id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  reward: string;
  status: string;
  medias?: Media[];
  entrepriseInfo?: {
    name: string;
    logo?: string;
  };
}

export default function CurrentOffers() {
  useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingOffer, setUploadingOffer] = useState<string | null>(null);
  const [mediaDescription, setMediaDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/ugc/current-offers');
      if (!response.ok) throw new Error('Erreur lors de la récupération des offres');
      const data = await response.json();
      setOffers(data);
    } catch (err) {
      setError('Erreur lors du chargement des offres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (offerCode: string, file: File) => {
    if (!file) return;

    setUploadingOffer(offerCode);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('offerCode', offerCode);
    formData.append('description', mediaDescription);
    formData.append('type', file.type.startsWith('image/') ? 'image' : 'video');

    try {
      const response = await fetch('/api/offers/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload du média");
      }

      // Rafraîchir les offres pour voir le nouveau média
      await fetchOffers();
      setMediaDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError("Erreur lors de l'upload du média");
    } finally {
      setUploadingOffer(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Chargement...</div>;
  }

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex items-center mb-6">
          <Link href="/ugc/dashboard" className="mr-4">
            <button className="bg-gray-200 rounded-full p-2">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mes offres en cours</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="space-y-6">
          {offers.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">Aucune offre en cours</p>
          ) : (
            offers.map((offer) => (
              <div key={offer._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{offer.name}</h2>
                    <p className="text-purple-600 font-medium">{offer.reward}</p>
                    {offer.entrepriseInfo && (
                      <p className="text-gray-600 text-sm mt-1">Par {offer.entrepriseInfo.name}</p>
                    )}
                  </div>
                  {offer.entrepriseInfo?.logo && (
                    <Image
                      src={offer.entrepriseInfo.logo}
                      alt="Logo entreprise"
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ajouter des médias</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Description du média"
                        value={mediaDescription}
                        onChange={(e) => setMediaDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaUpload(offer.code, file);
                          }}
                          className="hidden"
                          id={`file-${offer._id}`}
                        />
                        <label
                          htmlFor={`file-${offer._id}`}
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          <FontAwesomeIcon icon={faUpload} className="mr-2" />
                          Ajouter un média
                        </label>
                        {uploadingOffer === offer.code && (
                          <span className="text-gray-600">Upload en cours...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {offer.medias && offer.medias.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Médias ajoutés</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {offer.medias.map((media) => (
                          <div key={media._id} className="relative">
                            {media.type === 'image' ? (
                              <Image
                                src={`/api/offers/media/raw/${media._id}`}
                                alt={media.description || 'Image'}
                                className="rounded-lg object-cover w-full h-auto"
                              />
                            ) : (
                              <video
                                src={`/api/offers/media/raw/${media._id}`}
                                controls
                                className="rounded-lg w-full"
                              />
                            )}
                            <div className="flex justify-between items-center mt-2">
                              {media.description && (
                                <p className="text-sm text-gray-600">{media.description}</p>
                              )}
                              <a
                                href={`/api/offers/media/download/${media._id}`}
                                download
                                className="flex items-center text-sm text-purple-600 hover:text-purple-800"
                              >
                                <FontAwesomeIcon icon={faDownload} className="mr-1" />
                                Télécharger
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
}
