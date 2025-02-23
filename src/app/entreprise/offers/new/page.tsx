'use client';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React, { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

import Navbar from '../../../components/navbar';
import TopBar from '../../../components/topBar';
import '../../../globals.css';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewOffer() {
  useAuth(); // Vérifie si l'utilisateur est connecté
  const router = useRouter();
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    reward: '',
    location: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSearch = async (searchTerm: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Attendre 300ms après la dernière frappe avant de lancer la recherche
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              format: 'json',
              q: searchTerm,
              countrycodes: 'fr',
              addressdetails: '1',
              limit: '5',
              featuretype: 'city,street,house',
              'accept-language': 'fr',
            })
        );
        const data = await response.json();
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresse:", error);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleLocationSelect = (suggestion: AddressSuggestion) => {
    // Formater l'adresse de manière plus concise
    const address = suggestion.display_name
      .split(',')
      .slice(0, 3) // Prendre les 3 premiers éléments (numéro, rue, ville)
      .join(',')
      .trim();

    setFormData((prev) => ({
      ...prev,
      location: address,
    }));
    setShowSuggestions(false);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: value,
    }));
    handleLocationSearch(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation côté client
    if (!formData.name || formData.name.length < 3) {
      setError('Le nom de l&apos;offre doit contenir au moins 3 caractères');
      setIsSubmitting(false);
      return;
    }

    if (!formData.category) {
      setError('Veuillez sélectionner une catégorie');
      setIsSubmitting(false);
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      setIsSubmitting(false);
      return;
    }

    if (!formData.reward) {
      setError('Veuillez indiquer la rémunération proposée');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l&apos;offre');
      }

      router.push('/entreprise/offers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle offre</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de l&apos;offre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Mode">Mode</option>
              <option value="Beauté">Beauté</option>
              <option value="Sport">Sport</option>
              <option value="Technologie">Technologie</option>
            </select>
          </div>

          <div className="relative">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Adresse de l&apos;établissement
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleLocationChange}
              onFocus={() => formData.location.length >= 3 && setShowSuggestions(true)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Commencez à taper une adresse..."
            />
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="cursor-pointer hover:bg-purple-50 px-4 py-2"
                    onClick={() => handleLocationSelect(suggestion)}
                  >
                    {suggestion.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description du brief
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
              Rémunération proposée
            </label>
            <input
              type="text"
              id="reward"
              name="reward"
              required
              value={formData.reward}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#90579F' }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Publication en cours...' : "Publier l'offre"}
            </button>
          </div>
        </form>
      </div>
      <Navbar />
    </div>
  );
}
