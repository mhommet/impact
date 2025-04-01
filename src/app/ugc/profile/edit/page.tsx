'use client';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { jwtDecode } from 'jwt-decode';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/app/components/navbar';
import TopBar from '@/app/components/topBar';
import { useAuth } from '@/hooks/useAuth';

interface JwtPayload {
  userId: string;
  type: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface UgcProfile {
  code: string;
  name: string;
  description: string;
  location: string;
  title: string;
  profileImage: string;
  skills?: string[];
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    youtube?: string;
  };
  portfolio: {
    contracts: number;
    photos: number;
    comments: number;
  };
}

export default function EditProfile() {
  useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profile, setProfile] = useState<UgcProfile>({
    code: '',
    name: '',
    description: '',
    location: '',
    title: '',
    profileImage: '',
    skills: [],
    socialLinks: {},
    portfolio: {
      contracts: 0,
      photos: 0,
      comments: 0,
    },
  });
  const [newTag, setNewTag] = useState('');

  // Chargement du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/ugc/current`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialNetwork = name.split('.')[1];
      setProfile((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialNetwork]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLocationSearch = async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}, France&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  const handleLocationSelect = (suggestion: AddressSuggestion) => {
    setProfile((prev) => ({
      ...prev,
      location: suggestion.display_name,
    }));
    setShowSuggestions(false);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setProfile((prev) => ({
      ...prev,
      location: value,
    }));
    handleLocationSearch(value);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const addTag = () => {
    if (newTag.trim() === '') return;

    if (profile.skills?.includes(newTag.trim())) {
      return;
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newTag.trim()],
    }));
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((skill) => skill !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/ugc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      // Récupérer l'userId depuis le localStorage
      const userId = localStorage.getItem('userId');
      if (userId) {
        router.push(`/ugc/profile/${userId}`);
      } else {
        throw new Error('UserId non trouvé');
      }
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
          <Link href={`/ugc/profile/${profile.code}`} className="mr-4">
            <button className="bg-gray-200 rounded-full p-2">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Modifier mon profil</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
              Image de profil (URL)
            </label>
            <input
              type="text"
              id="profileImage"
              name="profileImage"
              value={profile.profileImage}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="URL de votre image de profil"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={profile.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre professionnel
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={profile.title}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="ex: Créateur de contenu UGC"
            />
          </div>

          <div className="relative">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Localisation
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={profile.location}
              onChange={handleLocationChange}
              onFocus={() => profile.location.length >= 3 && setShowSuggestions(true)}
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
              Bio
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={profile.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Réseaux sociaux</h3>

            <div>
              <label htmlFor="social.instagram" className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="text"
                id="social.instagram"
                name="social.instagram"
                value={profile.socialLinks.instagram || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="@votre_compte"
              />
            </div>

            <div>
              <label htmlFor="social.tiktok" className="block text-sm font-medium text-gray-700">
                TikTok
              </label>
              <input
                type="text"
                id="social.tiktok"
                name="social.tiktok"
                value={profile.socialLinks.tiktok || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="@votre_compte"
              />
            </div>

            <div>
              <label htmlFor="social.pinterest" className="block text-sm font-medium text-gray-700">
                Pinterest
              </label>
              <input
                type="text"
                id="social.pinterest"
                name="social.pinterest"
                value={profile.socialLinks.pinterest || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="@votre_compte"
              />
            </div>

            <div>
              <label htmlFor="social.youtube" className="block text-sm font-medium text-gray-700">
                YouTube
              </label>
              <input
                type="text"
                id="social.youtube"
                name="social.youtube"
                value={profile.socialLinks.youtube || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="@votre_compte"
              />
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tags</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Ajoutez vos tags pour améliorer les correspondances avec les offres
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={handleTagChange}
                  placeholder="Nouveau tag"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Ajouter
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 flex-shrink-0 inline-flex text-purple-500 hover:text-purple-700"
                    >
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#90579F' }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
      <Navbar />
    </div>
  );
}
