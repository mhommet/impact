"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

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
  const [error, setError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profile, setProfile] = useState<UgcProfile>({
    code: "",
    name: "",
    description: "",
    location: "",
    title: "",
    profileImage: "",
    socialLinks: {},
    portfolio: {
      contracts: 0,
      photos: 0,
      comments: 0
    }
  });

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
        console.error("Erreur lors du chargement du profil:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialNetwork = name.split(".")[1];
      setProfile(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialNetwork]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
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
    setProfile(prev => ({
      ...prev,
      location: suggestion.display_name
    }));
    setShowSuggestions(false);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setProfile(prev => ({
      ...prev,
      location: value
    }));
    handleLocationSearch(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/ugc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }

      // Récupérer l'userId depuis le localStorage
      const userId = localStorage.getItem("userId");
      if (userId) {
        router.push(`/ugc/profile/${userId}`);
      } else {
        throw new Error("UserId non trouvé");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier mon profil
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

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
                value={profile.socialLinks.instagram || ""}
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
                value={profile.socialLinks.tiktok || ""}
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
                value={profile.socialLinks.pinterest || ""}
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
                value={profile.socialLinks.youtube || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="@votre_compte"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#90579F" }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
      <Navbar />
    </div>
  );
} 