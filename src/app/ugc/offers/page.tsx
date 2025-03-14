'use client';

import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  faCheck,
  faDownload,
  faFilter,
  faHeart,
  faLocation,
  faSort,
  faStar,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Media } from '@/types/offer';

import { loginFetch } from '@/helpers/loginFetch';
import { useAuth } from '@/hooks/useAuth';

import Navbar from '../../components/navbar';
import TopBar from '../../components/topBar';
import '../../globals.css';

interface Offer {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  reward: string;
  location: string;
  distance?: number;
}

interface Coordinates {
  lat: number;
  lon: number;
}

interface CurrentOffer {
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

const getRestaurantImage = (index: number) => {
  // Utiliser seulement les images de 0 à 2 en boucle
  const imageIndex = index % 3;
  return `/img/restaurant${imageIndex}.png`;
};

const App = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isGeolocActive, setIsGeolocActive] = useState(false);
  const [maxDistance, setMaxDistance] = useState(1000);
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [cityCoordinatesCache, setCityCoordinatesCache] = useState<{ [key: string]: Coordinates }>(
    {}
  );
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [ugcLocation, setUgcLocation] = useState<string | null>(null);
  const [currentOffers, setCurrentOffers] = useState<CurrentOffer[]>([]);
  const [loadingCurrentOffers, setLoadingCurrentOffers] = useState(true);
  const [errorCurrentOffers, setErrorCurrentOffers] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState<string | null>(null);
  const [uploadingOffer, setUploadingOffer] = useState<string | null>(null);
  const [mediaDescription, setMediaDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useAuth();

  // Get unique categories
  const categories = Array.from(new Set(offers.map((offer) => offer.category)));

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c);

    return distance;
  };

  const getCityCoordinates = async (address: string): Promise<Coordinates> => {
    if (cityCoordinatesCache[address]) {
      return cityCoordinatesCache[address];
    }

    try {
      const params = new URLSearchParams({
        format: 'json',
        q: address,
        countrycodes: 'fr',
        addressdetails: '1',
        limit: '1',
        'accept-language': 'fr',
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const data = await response.json();

      if (data && data[0]) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
        setCityCoordinatesCache((prev) => ({ ...prev, [address]: coords }));
        return coords;
      }
      throw new Error('Adresse non trouvée');
    } catch (error) {
      console.error("Erreur lors de la géolocalisation de l'adresse:", error);
      throw error;
    }
  };

  // Modifier useEffect pour fetchOffers
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loginFetch('/api/offers');
        setAllOffers(data); // Garder toutes les offres
        setOffers(data);
        setFilteredOffers(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError(
          'Une erreur est survenue lors de la récupération des offres. Veuillez réessayer plus tard.'
        );
        setAllOffers([]);
        setOffers([]);
        setFilteredOffers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    fetchCurrentOffers();
  }, []);

  const fetchCurrentOffers = async () => {
    try {
      const response = await fetch('/api/ugc/current-offers');
      if (!response.ok) throw new Error('Erreur lors de la récupération des offres en cours');
      const data = await response.json();
      setCurrentOffers(data);
    } catch (err) {
      setErrorCurrentOffers('Erreur lors du chargement des offres en cours');
      console.error(err);
    } finally {
      setLoadingCurrentOffers(false);
    }
  };

  const handleGeolocation = async () => {
    setIsLoading(true);
    try {
      const data = await loginFetch('/api/ugc/current');

      if (!data || !data.location) {
        setError('Veuillez définir votre localisation dans votre profil');
        setIsGeolocActive(false);
        return;
      }

      setUgcLocation(data.location);
      await processGeolocation(data.location);
      setIsGeolocActive(true);
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      setError('Impossible de récupérer votre localisation');
      setIsGeolocActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const processGeolocation = async (location: string) => {
    try {
      console.log('Récupération des coordonnées pour:', location);
      const coordinates = await getCityCoordinates(location);
      console.log('Coordonnées obtenues:', coordinates);
      setUserLocation(coordinates);
      await updateOffersWithDistance(coordinates);
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error);
      setError('Impossible de déterminer votre localisation');
      setIsGeolocActive(false);
    }
  };

  const updateOffersWithDistance = async (userCoords: Coordinates) => {
    console.log('Position UGC:', userCoords);

    const offersWithDistances = await Promise.all(
      allOffers
        .filter((offer) => offer.location)
        .map(async (offer) => {
          try {
            console.log(`Calcul distance pour l'offre "${offer.name}" à ${offer.location}`);
            const coordinates = await getCityCoordinates(offer.location);
            console.log(`Coordonnées obtenues pour ${offer.name}:`, coordinates);

            const distance = calculateDistance(
              userCoords.lat,
              userCoords.lon,
              coordinates.lat,
              coordinates.lon
            );

            console.log(`Distance finale pour ${offer.name}: ${distance}km`);
            return { ...offer, distance };
          } catch (error) {
            console.error(`Erreur pour l'offre ${offer.name}:`, error);
            return null;
          }
        })
    );

    // Filtrer les offres nulles et celles dépassant la distance maximale
    const validOffers = offersWithDistances
      .filter(
        (offer): offer is Offer & { distance: number } =>
          offer !== null && offer.distance !== undefined && offer.distance <= maxDistance
      )
      .sort((a, b) => a.distance - b.distance);

    setOffers(validOffers);
    setFilteredOffers(validOffers);
  };

  const handleMaxDistanceChange = async (newDistance: number) => {
    setMaxDistance(newDistance);
    if (isGeolocActive && userLocation) {
      setIsLoading(true);
      await updateOffersWithDistance(userLocation);
      setIsLoading(false);
    }
  };

  // Filter offers based on search term and category
  useEffect(() => {
    if (Array.isArray(offers)) {
      const filtered = offers.filter((offer) => {
        const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? offer.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      });
      setFilteredOffers(filtered);
    }
  }, [searchTerm, selectedCategory, offers]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryFilter(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
  };

  const disableGeolocation = () => {
    setIsGeolocActive(false);
    setUserLocation(null);
    setOffers(allOffers);
    setFilteredOffers(allOffers);
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
      await fetchCurrentOffers();
      setMediaDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrorCurrentOffers("Erreur lors de l'upload du média");
    } finally {
      setUploadingOffer(null);
    }
  };

  const handleSubmitForValidation = async (offerId: string) => {
    setSubmittingOffer(offerId);
    try {
      const response = await fetch('/api/offers/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          status: 'pending_validation',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission pour validation');
      }

      // Rafraîchir les offres
      await fetchCurrentOffers();
    } catch (error) {
      console.error('Erreur:', error);
      setErrorCurrentOffers('Erreur lors de la soumission pour validation');
    } finally {
      setSubmittingOffer(null);
    }
  };

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Offres en cours</h1>
        {loadingCurrentOffers ? (
          <div className="text-center mt-8">Chargement des offres en cours...</div>
        ) : errorCurrentOffers ? (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{errorCurrentOffers}</div>
        ) : currentOffers.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">Aucune offre en cours</p>
        ) : (
          <div className="space-y-6">
            {currentOffers.map((offer) => (
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

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleSubmitForValidation(offer._id)}
                      disabled={
                        submittingOffer === offer._id || offer.status === 'pending_validation'
                      }
                      className={`inline-flex items-center px-4 py-2 rounded-md ${
                        offer.status === 'pending_validation'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      {offer.status === 'pending_validation'
                        ? 'En attente de validation'
                        : submittingOffer === offer._id
                          ? 'Soumission en cours...'
                          : 'Soumettre pour validation'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#182F53] via-[#544697] to-[#90579F] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div>
            <h3 className="text-gray-900 text-xl font-bold">Les annonces à la une</h3>
            <div className="flex items-center justify-between space-x-4 mt-5">
              {Array.isArray(offers) && offers.length > 0 && (
                <>
                  <button className="rounded-full text-xl font-bold">&lt;</button>
                  <Link href={`/ugc/offer/${offers[offers.length - 1].code}`}>
                    <div
                      key={offers[offers.length - 1].code}
                      className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full"
                    >
                      <div className="md:flex">
                        <div className="md:flex-shrink-0 h-48 md:h-auto w-full overflow-hidden">
                          <Image
                            width={400}
                            height={300}
                            className="h-full w-full object-cover md:w-full"
                            src={getRestaurantImage(3)}
                            alt="Restaurant image"
                          />
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-center">
                          <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                            {offers[offers.length - 1].name}
                          </div>
                          <div>
                            <span className="inline-block text-yellow-600 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">
                              <span>
                                <FontAwesomeIcon icon={faStar} />
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faStar} />
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faStar} />
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faStar} />
                              </span>
                              <span>
                                <FontAwesomeIcon icon={faStar} />
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-gray-400">
                          {offers[offers.length - 1].category}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <button
                            style={{ backgroundColor: '#90579F' }}
                            className="hover:bg-indigo-700 text-white font-bold py-1 px-2 text-xs rounded-md"
                          >
                            Voir le brief
                          </button>
                          <div>
                            {/* Replace with your heart icon */}
                            <span>
                              <FontAwesomeIcon icon={faHeart} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button className="rounded-full text-xl font-bold">&gt;</button>
                </>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-gray-900 text-xl font-bold mt-8">
              Ces annonces qui pourraient vous intéresser...
            </h3>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center md:justify-between md:space-x-4 mt-5">
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4 relative">
                <button className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-md">
                  <span className="text-gray-600">
                    <FontAwesomeIcon icon={faSort} />
                  </span>{' '}
                  Trier
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className={`text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-md ${selectedCategory ? 'bg-purple-100' : ''}`}
                  >
                    <span className="text-gray-600">
                      <FontAwesomeIcon icon={faFilter} />
                    </span>{' '}
                    {selectedCategory || 'Filtrer'}
                  </button>
                  {showCategoryFilter && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1">
                      <button
                        onClick={resetFilters}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Tous
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDistanceFilter(!showDistanceFilter)}
                    className={`text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-md ${isGeolocActive ? 'bg-purple-100' : ''}`}
                  >
                    Distance max: {maxDistance}km
                  </button>
                  {showDistanceFilter && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 p-4">
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={maxDistance}
                        onChange={(e) => handleMaxDistanceChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center mt-2">{maxDistance} km</div>
                    </div>
                  )}
                </div>
                {isGeolocActive ? (
                  <button
                    onClick={disableGeolocation}
                    className="text-white bg-purple-600 px-2 py-1 flex items-center rounded-md"
                  >
                    <span className="text-white">
                      <FontAwesomeIcon icon={faLocation} />
                    </span>{' '}
                    Désactiver la géoloc
                  </button>
                ) : (
                  <button
                    onClick={handleGeolocation}
                    className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-md"
                  >
                    <span className="text-gray-600">
                      <FontAwesomeIcon icon={faLocation} />
                    </span>{' '}
                    Me géolocaliser
                  </button>
                )}
              </div>
            </div>
            {(selectedCategory || searchTerm) && (
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-gray-500">Filtres actifs:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-1 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Recherche: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
          {isGeolocActive && (
            <div className="mt-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-md flex items-center justify-between">
              <span>Géolocalisation active - Les offres sont triées par distance</span>
              <button onClick={handleGeolocation} className="text-purple-600 hover:text-purple-800">
                Réinitialiser
              </button>
            </div>
          )}
          <div className="flex justify-between">
            {isLoading ? (
              <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                <h2 className="text-center text-white text-xl font-semibold">Chargement...</h2>
                <p className="w-1/3 text-center text-white">
                  Les offres sont en train de charger, cela peut prendre quelques secondes, veuillez
                  garder la page ouverte.
                </p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">Erreur ! </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              </div>
            ) : (
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full"
              >
                {filteredOffers.length > 0 ? (
                  filteredOffers.map((offer, index) => (
                    <Link key={offer.id} href={`/ugc/offer/${offer.code}`}>
                      <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full">
                        <div className="md:flex">
                          <div className="md:flex-shrink-0 h-48 md:h-auto">
                            <Image
                              width={400}
                              height={300}
                              className="h-full w-full object-cover md:w-full"
                              src={getRestaurantImage(index)}
                              alt="Restaurant image"
                            />
                          </div>
                          <div className="p-8">
                            <div className="flex justify-between items-center">
                              <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                                {offer.name}
                              </div>
                              <div>
                                <span className="inline-block text-yellow-600 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">
                                  <span>
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                  <span>
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                  <span>
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                  <span>
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                  <span>
                                    <FontAwesomeIcon icon={faStar} />
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-gray-400">
                              {offer.category} - {offer.location}
                              {offer.distance !== undefined && ` (${offer.distance}km)`}
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <button
                                style={{ backgroundColor: '#90579F' }}
                                className="hover:bg-indigo-700 text-white font-bold py-1 px-2 text-xs rounded-md"
                              >
                                Voir le brief
                              </button>
                              <div>
                                <span className="text-red-600">
                                  <FontAwesomeIcon icon={faHeart} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm
                        ? 'Aucune offre ne correspond à votre recherche.'
                        : 'Aucune offre disponible pour le moment.'}
                    </p>
                  </div>
                )}
              </ul>
            )}
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <Navbar />
      </div>
    </div>
  );
};

export default App;
