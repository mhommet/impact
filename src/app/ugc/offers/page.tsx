"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Image from "next/image";
import Navbar from "../../components/navbar";
import TopBar from "../../components/topBar";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Link from "next/link";
import {
  faFilter,
  faHeart,
  faLocation,
  faSort,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loginFetch } from "@/helpers/loginFetch";

interface Offer {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  reward: string;
}

const getRestaurantImage = (index: number) => {
  // Utiliser seulement les images de 0 à 2 en boucle
  const imageIndex = index % 3;
  return `/img/restaurant${imageIndex}.png`;
};

const App = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(offers.map(offer => offer.category)));

  // Fetching offers
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loginFetch('/api/offers');
        setOffers(data);
        setFilteredOffers(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError("Une erreur est survenue lors de la récupération des offres. Veuillez réessayer plus tard.");
        setOffers([]);
        setFilteredOffers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffers();
  }, []);

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
    setSelectedCategory("");
    setSearchTerm("");
  };

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#182F53] via-[#544697] to-[#90579F] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div>
          <h3 className="text-gray-900 text-xl font-bold">
            Les annonces à la une
          </h3>
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
                        width={100}
                        height={100}
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
                          style={{ backgroundColor: "#90579F" }}
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
                </span>{" "}
                Trier
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-md ${selectedCategory ? 'bg-purple-100' : ''}`}
                >
                  <span className="text-gray-600">
                    <FontAwesomeIcon icon={faFilter} />
                  </span>{" "}
                  {selectedCategory || "Filtrer"}
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
              <button className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-md">
                <span className="text-gray-600">
                  <FontAwesomeIcon icon={faLocation} />
                </span>{" "}
                Me géolocaliser
              </button>
            </div>
          </div>
          {(selectedCategory || searchTerm) && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              {selectedCategory && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("")}
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
                    onClick={() => setSearchTerm("")}
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
        <div className="flex justify-between">
          {isLoading ? (
            <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
              <h2 className="text-center text-white text-xl font-semibold">Chargement...</h2>
              <p className="w-1/3 text-center text-white">
                Les offres sont en train de charger, cela peut prendre quelques secondes, veuillez garder la page ouverte.
              </p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur ! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          ) : (
            <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer, index) => (
                  <Link key={offer.id} href={`/ugc/offer/${offer.code}`}>
                    <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full">
                      <div className="md:flex">
                        <div className="md:flex-shrink-0 h-48 md:h-auto">
                          <Image
                            width={100}
                            height={100}
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
                            {offer.category}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <button
                              style={{ backgroundColor: "#90579F" }}
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
                    {searchTerm ? "Aucune offre ne correspond à votre recherche." : "Aucune offre disponible pour le moment."}
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
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <Navbar />
    </div>
  );
};

export default App;
