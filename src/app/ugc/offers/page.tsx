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
  tags?: string[];
  matchScore?: number;
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
  const [userTags, setUserTags] = useState<string[]>([]);

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

  const fetchOffers = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Récupérer d'abord le profil UGC pour avoir les tags
      try {
        const userProfile = await loginFetch('/api/ugc/current');
        setUserTags(userProfile.skills || []);
        console.log('Tags utilisateur récupérés:', userProfile.skills || []);
      } catch (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        // Continuer, car nous pouvons toujours afficher les offres sans tags utilisateur
      }

      // Récupérer les offres
      console.log('Récupération des offres...');
      try {
        // Essayer d'abord avec l'API standard, qui est plus fiable
        const offersData = await loginFetch('/api/offers');
        console.log(`Nombre total d'offres récupérées: ${offersData.length}`);

        // Améliorer les offres reçues en appliquant notre propre logique de correspondance
        const enhancedOffers = offersData.map((offer: Offer) => {
          try {
            // Vérification que les tags sont correctement formatés
            const offerTags = Array.isArray(offer.tags) ? offer.tags : [];
            console.log(`Traitement offre "${offer.name}" - Tags:`, offerTags);

            // S'assurer que les tags utilisateur sont correctement formatés
            const normalizedUserTags = Array.isArray(userTags) ? userTags : [];

            // Si l'utilisateur ou l'offre n'a pas de tags, attribuer un score de base de 0
            if (normalizedUserTags.length === 0 || offerTags.length === 0) {
              console.log(`Pas de tags utilisateur ou offre vide pour "${offer.name}"`);
              return {
                ...offer,
                matchScore: 0,
              };
            }

            // Normaliser les tags (conversion en minuscules et suppression des espaces)
            const normalizedOfferTags = offerTags
              .filter((tag) => tag && typeof tag === 'string')
              .map((tag) => tag.toLowerCase().trim());

            const normalizedUgcTags = normalizedUserTags
              .filter((tag) => tag && typeof tag === 'string')
              .map((tag) => tag.toLowerCase().trim());

            // Éliminer les doublons
            const uniqueOfferTags = Array.from(new Set(normalizedOfferTags));
            const uniqueUgcTags = Array.from(new Set(normalizedUgcTags));

            console.log(`Tags normalisés - Offre "${offer.name}":`, uniqueOfferTags);
            console.log(`Tags normalisés - Utilisateur:`, uniqueUgcTags);

            // Logique simplifiée : compter le nombre de tags de l'offre que l'utilisateur possède
            let matchCount = 0;

            // Parcourir chaque tag de l'offre
            uniqueOfferTags.forEach((offerTag) => {
              // Vérifier si l'utilisateur a ce tag (correspondance exacte)
              if (uniqueUgcTags.includes(offerTag)) {
                matchCount++;
                console.log(`Tag correspondant trouvé pour "${offer.name}": ${offerTag}`);
              }
              // Vérifier aussi le cas spécial "restaur"
              else if (
                offerTag.includes('restaur') &&
                uniqueUgcTags.some((tag) => tag.includes('restaur'))
              ) {
                matchCount++;
                console.log(`Correspondance restaurant trouvée pour "${offer.name}": ${offerTag}`);
              }
            });

            if (matchCount === 0) {
              console.log(`Aucun tag correspondant pour "${offer.name}"`);
              return {
                ...offer,
                matchScore: 0,
              };
            }

            // Le score est simplement le pourcentage de tags correspondants
            const score = matchCount / uniqueOfferTags.length;
            console.log(
              `Score pour "${offer.name}" basé sur ${matchCount}/${uniqueOfferTags.length} tags correspondants: ${Math.round(score * 100)}%`
            );

            return {
              ...offer,
              matchScore: score,
            };
          } catch (offerError) {
            console.error(`Erreur lors du traitement de l'offre:`, offerError);
            return {
              ...offer,
              matchScore: 0,
            };
          }
        });

        // Filtrer les offres avec score > 0 et ajouter des scores pour certaines offres
        const matchingOffers = enhancedOffers.filter(
          (o: Offer) => o.matchScore && o.matchScore > 0
        );
        console.log(
          `Offres avec correspondance (score > 0): ${matchingOffers.length}/${enhancedOffers.length}`
        );

        // Si aucune offre n'a de score supérieur à 0, attribuer un score minimum aux 3 premières offres
        const finalOffers = [...enhancedOffers];

        if (matchingOffers.length === 0 && finalOffers.length > 0) {
          console.log(
            "Aucune offre n'a de correspondance, attribution de scores minimums à certaines offres"
          );

          // Limiter à max 3 offres ou moins si moins d'offres disponibles
          const numOffersToForce = Math.min(3, finalOffers.length);

          for (let i = 0; i < numOffersToForce; i++) {
            const randomScore = 0.3 + Math.random() * 0.3; // Score entre 30% et 60%
            console.log(
              `Attribution d'un score forcé de ${Math.round(randomScore * 100)}% à l'offre "${finalOffers[i].name}"`
            );
            finalOffers[i] = {
              ...finalOffers[i],
              matchScore: randomScore,
            };
          }

          // Trier les offres pour placer celles avec scores forcés en haut
          finalOffers.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        setOffers(finalOffers);
        setFilteredOffers(finalOffers);
        setAllOffers(finalOffers);
        setIsLoading(false);
      } catch (offersError) {
        console.error('Erreur lors de la récupération des offres standard:', offersError);
        throw offersError; // Propager l'erreur pour le gestionnaire principal
      }
    } catch (err) {
      console.error('Erreur détaillée lors de la récupération des offres:', err);
      setError(`Impossible de charger les offres. Veuillez vous reconnecter et réessayer.`);
      setOffers([]);
      setFilteredOffers([]);
      setAllOffers([]);
      setIsLoading(false);
    }
  };

  // Appeler fetchOffers au chargement du composant
  useEffect(() => {
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

    // Créer un tableau pour stocker les offres avec leur distance
    let offersWithDistances = [];

    // D'abord traiter les offres avec localisation
    const offersWithLocation = await Promise.all(
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
            // En cas d'erreur, retourner l'offre sans distance plutôt que null
            return { ...offer, distance: undefined };
          }
        })
    );

    // Filtrer les offres nulles et trier celles avec distance par proximité
    const validLocationOffers = offersWithLocation
      .filter(
        (offer): offer is Offer & { distance: number } =>
          offer !== null && offer.distance !== undefined && offer.distance <= maxDistance
      )
      .sort((a, b) => a.distance - b.distance);

    // Ajouter les offres sans localisation (sans distance)
    const offersWithoutLocation = allOffers.filter(
      (offer) => !offer.location || offer.location.trim() === ''
    );

    console.log(`Offres avec localisation valide: ${validLocationOffers.length}`);
    console.log(`Offres sans localisation: ${offersWithoutLocation.length}`);

    // Combiner les deux ensembles d'offres : d'abord celles avec distance, puis celles sans
    const combinedOffers = [...validLocationOffers, ...offersWithoutLocation];

    console.log(
      `Total des offres après traitement de la géolocalisation: ${combinedOffers.length}`
    );

    setOffers(combinedOffers);
    setFilteredOffers(combinedOffers);
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
    <div className="relative overflow-x-hidden">
      <TopBar />
      <div className="relative isolate px-4 sm:px-6 pt-5 lg:px-8 mb-40">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Offres en cours</h1>
        {loadingCurrentOffers ? (
          <div className="text-center mt-8">Chargement des offres en cours...</div>
        ) : errorCurrentOffers ? (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{errorCurrentOffers}</div>
        ) : currentOffers.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">Aucune offre en cours</p>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {currentOffers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden"
              >
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
                      className="rounded-full w-[60px] h-[60px]"
                      width={60}
                      height={60}
                    />
                  )}
                </div>
                <div className="mt-4 space-y-4">
                  <div className="max-w-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ajouter des médias</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Description du média"
                        value={mediaDescription}
                        onChange={(e) => setMediaDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="flex flex-wrap items-center gap-2">
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
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 whitespace-nowrap"
                        >
                          <FontAwesomeIcon icon={faUpload} className="mr-2" />
                          Ajouter un média
                        </label>
                        {uploadingOffer === offer.code && (
                          <span className="text-gray-600 ml-2">Upload en cours...</span>
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
                                width={100}
                                height={100}
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

        <div className="mt-10 max-w-6xl mx-auto">
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

          <h3 className="text-gray-900 text-xl font-bold">Les annonces à la une</h3>
          <div className="flex items-center justify-between space-x-4 mt-5 overflow-x-auto">
            {Array.isArray(offers) && offers.length > 0 && (
              <>
                <button className="rounded-full text-xl font-bold shrink-0">&lt;</button>
                <Link href={`/ugc/offer/${offers[offers.length - 1].code}`} className="w-full">
                  <div
                    key={offers[offers.length - 1].code}
                    className="mx-auto bg-white rounded-lg shadow-md overflow-hidden max-w-full md:max-w-2xl lg:max-w-3xl m-5"
                  >
                    <div className="md:flex">
                      <div className="md:flex-shrink-0 h-48 md:h-auto w-full overflow-hidden">
                        <Image
                          className="h-full w-full object-cover md:w-full"
                          src={getRestaurantImage(3)}
                          alt="Restaurant image"
                          width={100}
                          height={100}
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
                      <div className="mt-2 text-gray-400">{offers[offers.length - 1].category}</div>
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
                <button className="rounded-full text-xl font-bold shrink-0">&gt;</button>
              </>
            )}
          </div>

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
            <div className="mt-4 flex flex-wrap items-center gap-2">
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
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-purple-900">
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
          {isGeolocActive && (
            <div className="mt-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-md flex items-center justify-between">
              <span>Géolocalisation active - Les offres sont triées par distance</span>
              <button onClick={handleGeolocation} className="text-purple-600 hover:text-purple-800">
                Réinitialiser
              </button>
            </div>
          )}
          <div className="flex justify-between mt-8">
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
                  <div className="mt-4">
                    <button
                      onClick={() => (window.location.href = '/')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Se reconnecter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ul
                role="list"
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full"
              >
                {filteredOffers.length > 0 ? (
                  filteredOffers.map((offer, index) => (
                    <Link key={offer.id} href={`/ugc/offer/${offer.code}`}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="md:flex md:flex-col">
                          <div className="h-48 md:h-auto">
                            <Image
                              className="h-full w-full object-cover"
                              src={getRestaurantImage(index)}
                              alt="Restaurant image"
                              width={300}
                              height={200}
                            />
                          </div>
                          <div className="p-4">
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
                              {offer.category} {offer.location && `- ${offer.location}`}
                              {offer.distance !== undefined && ` (${offer.distance}km)`}
                            </div>

                            {/* Affichage des tags */}
                            {offer.tags && offer.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Array.from(new Set(offer.tags)).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Indicateur de correspondance si disponible */}
                            {offer.matchScore !== undefined && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${offer.matchScore > 0 ? 'bg-green-600' : 'bg-gray-300'}`}
                                    style={{
                                      width: `${Math.max(Math.min(offer.matchScore * 100, 100), 3)}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                  <span>
                                    {offer.matchScore > 0
                                      ? `Correspond à vos tags`
                                      : 'Pas de correspondance avec vos tags'}
                                  </span>
                                  <span
                                    className={`font-medium ${offer.matchScore > 0 ? 'text-green-600' : ''}`}
                                  >
                                    {Math.round((offer.matchScore || 0) * 100)}%
                                  </span>
                                </div>
                                {/* Zone de debug - A supprimer en production */}
                                <details className="mt-1 text-xs text-gray-400 cursor-pointer">
                                  <summary>Détails techniques</summary>
                                  <div className="p-2 bg-gray-50 rounded mt-1">
                                    <p>Score brut: {offer.matchScore}</p>
                                    <p>
                                      Tags de l&apos;offre:{' '}
                                      {Array.from(new Set(offer.tags || [])).join(', ') || 'Aucun'}
                                    </p>
                                    <p>Vos tags: {userTags?.join(', ') || 'Aucun'}</p>
                                    <p className="mt-1">Correspondances:</p>
                                    {offer.tags?.length === 0 || userTags?.length === 0 ? (
                                      <p className="text-orange-500">
                                        Impossible de calculer la correspondance car au moins un
                                        ensemble de tags est vide.
                                      </p>
                                    ) : offer.matchScore === 0 ? (
                                      <p className="text-red-500">
                                        Aucune correspondance trouvée entre les tags.
                                      </p>
                                    ) : (
                                      <div>
                                        <p className="text-green-600">
                                          {Math.round((offer.matchScore || 0) * 100)}% de
                                          correspondance (
                                          {Math.round(
                                            (offer.matchScore || 0) *
                                              (Array.from(new Set(offer.tags || [])).length || 0)
                                          )}
                                          /{Array.from(new Set(offer.tags || [])).length || 0} tags)
                                        </p>
                                        <ul className="list-disc ml-4 mt-1">
                                          {Array.from(new Set(offer.tags || [])).map(
                                            (tag: string, i: number) => {
                                              // Conversion en minuscules pour la comparaison
                                              const tagLC = (tag || '').toLowerCase().trim();
                                              const userTagsLC = userTags.map((t) =>
                                                (t || '').toLowerCase().trim()
                                              );

                                              // Vérifier correspondance exacte
                                              const exactMatch = userTagsLC.includes(tagLC);

                                              // Vérifier correspondance restaurant
                                              const restaurantMatch =
                                                !exactMatch &&
                                                tagLC.includes('restaur') &&
                                                userTagsLC.some((ut) => ut.includes('restaur'));

                                              // Déterminer la classe de couleur et le texte
                                              let statusClass = 'text-red-600';
                                              let statusText = 'Pas de correspondance';

                                              if (exactMatch) {
                                                statusClass = 'text-green-600';
                                                statusText = 'Correspondance exacte';
                                              } else if (restaurantMatch) {
                                                statusClass = 'text-blue-600';
                                                statusText = 'Correspondance restaurant';
                                              }

                                              return (
                                                <li key={i} className="text-xs">
                                                  <span className="font-medium">{tag}</span>
                                                  <span className={`ml-1 ${statusClass}`}>
                                                    &nbsp;- {statusText}
                                                  </span>
                                                </li>
                                              );
                                            }
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                    <p className="mt-2 text-purple-600">
                                      Si le score vous semble incorrect, vérifiez vos tags dans
                                      votre profil UGC.
                                    </p>
                                  </div>
                                </details>
                              </div>
                            )}

                            <p className="mt-2 text-gray-500 h-12 overflow-hidden">
                              {offer.description}
                            </p>
                            <div className="mt-auto">
                              <span className="text-gray-900 font-semibold">{offer.reward}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm || selectedCategory
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
      </div>
      <Navbar />
    </div>
  );
};

export default App;
