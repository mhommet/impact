'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faInstagram, faPinterest, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Box, Card, CardContent, Divider, Grid, Rating, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/app/components/navbar';
import TopBar from '@/app/components/topBar';

config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's imported above

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

interface Candidature {
  _id: string;
  offerCode: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  offerInfo: {
    name: string;
    category: string;
    description: string;
    reward: string;
    entrepriseInfo: {
      name: string;
      logo: string;
    };
  };
}

interface Rating {
  rating: number;
  comment: string;
  name: string;
  logo?: string;
}

interface Collaboration {
  _id: string;
  title: string;
  description: string;
  completedAt: string;
  offerCode: string;
  entrepriseId: string;
  entrepriseInfo: {
    name: string;
    logo: string;
    code: string;
  };
  rating: {
    rating: number;
    comment: string;
  } | null;
}

interface Profile {
  name: string;
  email?: string;
  bio?: string;
  skills?: string[];
  profileImage?: string;
  averageRating?: number;
  location?: string;
  title?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    instagram?: string;
    tiktok?: string;
    pinterest?: string;
    youtube?: string;
  };
  portfolio?: {
    contracts: number;
    photos: number;
    comments: number;
  };
  ratings?: Array<{
    rating: number;
    comment: string;
    createdAt: string;
    entrepriseInfo: {
      name: string;
      logo: string;
    };
  }>;
  candidatures?: Candidature[];
}

export default function Ugc({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<{ rating: number; comment: string }>({
    rating: 0,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for id:', params.id);
        if (!params.id) {
          console.error('No ID provided');
          router.push('/ugc/login');
          return;
        }

        const response = await fetch(`/api/ugc/${params.id}`);
        if (!response.ok) {
          console.error('Error response:', response.status, await response.text());
          throw new Error('Erreur lors de la récupération du profil');
        }
        const data = await response.json();
        console.log('Profile data:', data);
        setProfile(data);

        // Vérifier si c'est le profil de l'utilisateur courant
        const storedUserCode = localStorage.getItem('userCode');
        console.log('Stored user code:', storedUserCode, 'Current profile id:', params.id);
        setIsCurrentUser(storedUserCode === params.id);
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/ugc/login');
      }
    };

    const fetchCollaborations = async () => {
      try {
        const response = await fetch(`/api/ugc/${params.id}/collaborations`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des collaborations');
        }
        const data = await response.json();
        console.log('Collaborations data:', data);
        setCollaborations(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchProfile();
    fetchCollaborations();
  }, [params.id, router]);

  const handleRatingSubmit = async () => {
    if (!selectedCollaboration) return;
    if (!newRating.rating || !newRating.comment) {
      setError('Veuillez fournir une note et un commentaire');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: selectedCollaboration.offerCode,
          toId: selectedCollaboration.entrepriseInfo.code,
          rating: newRating.rating,
          comment: newRating.comment,
          type: 'entreprise',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi de l'avis");
      }

      // Mettre à jour la collaboration dans la liste
      setCollaborations((prevCollabs) =>
        prevCollabs.map((collab) =>
          collab._id === selectedCollaboration._id
            ? {
                ...collab,
                rating: {
                  rating: newRating.rating,
                  comment: newRating.comment,
                },
              }
            : collab
        )
      );

      // Fermer le modal et réinitialiser
      setIsModalOpen(false);
      setSelectedCollaboration(null);
      setNewRating({ rating: 0, comment: '' });
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return 'En attente';
    }
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css"
        />
        <link
          rel="stylesheet"
          href="https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css"
        />
      </Head>
      <TopBar />
      <button
        onClick={() => router.back()}
        className="absolute top-20 left-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6 text-gray-600" />
      </button>
      <section className="pt-16 mb-24">
        <div className="w-full lg:full px-4 mx-auto">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 flex justify-center">
                  <div className="relative w-40 h-40 -mt-16">
                    <Image
                      src={
                        profile.profileImage ||
                        'https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png'
                      }
                      alt="Photo de profil"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="shadow-xl rounded-full border-none"
                      priority
                    />
                  </div>
                </div>
              </div>
              {isCurrentUser && (
                <Link href="/ugc/profile/edit">
                  <button
                    style={{ backgroundColor: '#90579F' }}
                    className="text-white p-3 rounded-full w-12 h-12 flex items-center justify-center hover:bg-purple-700 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPencilAlt as IconProp} />
                  </button>
                </Link>
              )}
              <div className="text-center mt-12">
                <h3 className="text-4xl font-semibold leading-normal mb-2 text-gray-800">
                  {profile.name}
                </h3>

                <div className="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold uppercase">
                  <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-500"></i>
                  {profile.location}
                </div>
                <div className="mb-2 text-gray-700 mt-4">{profile.title}</div>
                <div className="flex justify-center space-x-4 mt-6">
                  {profile.socialLinks?.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <FontAwesomeIcon icon={faInstagram as IconProp} size="2x" />
                    </a>
                  )}
                  {profile.socialLinks?.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profile.socialLinks.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTiktok as IconProp} size="2x" />
                    </a>
                  )}
                  {profile.socialLinks?.pinterest && (
                    <a
                      href={`https://pinterest.com/${profile.socialLinks.pinterest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faPinterest as IconProp} size="2x" />
                    </a>
                  )}
                  {profile.socialLinks?.youtube && (
                    <a
                      href={`https://youtube.com/@${profile.socialLinks.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faYoutube as IconProp} size="2x" />
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-10 py-10 border-t border-gray-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-gray-800">{profile.bio}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center py-4 lg:pt-4 pt-8 border-t border-gray-200">
                <div className="mr-4 p-3 text-center">
                  <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                    {profile.portfolio?.contracts || 0}
                  </span>
                  <span className="text-sm text-gray-500">Contrats</span>
                </div>
                <div className="mr-4 p-3 text-center">
                  <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                    {profile.portfolio?.photos || 0}
                  </span>
                  <span className="text-sm text-gray-500">Photos</span>
                </div>
                <div className="lg:mr-4 p-3 text-center">
                  <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                    {profile.portfolio?.comments || 0}
                  </span>
                  <span className="text-sm text-gray-500">Commentaires</span>
                </div>
              </div>

              {/* Section des collaborations récentes */}
              <div className="mt-10 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 text-center my-6">
                  Collaborations Récentes
                </h2>
                <div className="flex flex-wrap gap-6 justify-center px-6 pb-10">
                  {collaborations.length > 0 ? (
                    collaborations.map((collab) => (
                      <div
                        key={collab._id}
                        className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64"
                      >
                        <div className="relative w-20 h-20 mb-2">
                          <Image
                            src={collab.entrepriseInfo.logo || '/img/default-company.png'}
                            alt={collab.entrepriseInfo.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-center">{collab.entrepriseInfo.name}</h3>
                        <p className="text-sm text-gray-500 text-center mb-2">{collab.title}</p>
                        <Link href={`/entreprise/profile/${collab.entrepriseInfo.code}`}>
                          <button
                            style={{ backgroundColor: '#90579F' }}
                            className="text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors duration-200"
                          >
                            Voir le profil
                          </button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucune collaboration récente.</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Section des avis */}
              <div className="mt-10 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 text-center my-6">
                  Avis des entreprises
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-10">
                  {profile.ratings && profile.ratings.length > 0 ? (
                    profile.ratings.map((rating, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                          <div className="relative w-12 h-12 mr-4">
                            <Image
                              src={rating.entrepriseInfo.logo}
                              alt={rating.entrepriseInfo.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{rating.entrepriseInfo.name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600">{rating.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">Aucun avis pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal pour laisser un avis */}
      {isModalOpen && selectedCollaboration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Laisser un avis pour {selectedCollaboration.entrepriseInfo.name}
            </h3>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <Rating
                value={newRating.rating}
                onChange={(_, value) => setNewRating((prev) => ({ ...prev, rating: value || 0 }))}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={newRating.comment}
                onChange={(e) => setNewRating((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Votre expérience avec cette entreprise..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCollaboration(null);
                  setNewRating({ rating: 0, comment: '' });
                  setError(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={submitting}
                style={{ backgroundColor: '#90579F' }}
                className="text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
}
