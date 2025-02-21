"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Navbar from "@/app/components/navbar";
import TopBar from "@/app/components/topBar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faInstagram,
  faTiktok,
  faPinterest,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faPencilAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Card, CardContent, Typography, Rating, Box, Avatar, Grid, Divider } from '@mui/material';
import { loginFetch } from '@/helpers/loginFetch';

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
  status: "pending" | "accepted" | "rejected";
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
  entrepriseRating: Rating;
}

interface Profile {
  name: string;
  email: string;
  bio: string;
  skills: string[];
  profileImage?: string;
  averageRating: number;
  location: string;
  title: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export default function Ugc({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const router = useRouter();
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await loginFetch(`/api/ugc/${params.id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }
        const data = await response.json();
        setProfile(data);

        // Vérifier si c'est le profil de l'utilisateur courant
        const storedUserId = localStorage.getItem("userId");
        setIsCurrentUser(storedUserId === params.id);
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/ugc/login');
      }
    };

    const fetchCollaborations = async () => {
      try {
        const response = await loginFetch(`/api/ugc/${params.id}/collaborations`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des collaborations');
        }
        const data = await response.json();
        setCollaborations(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchProfile();
    fetchCollaborations();
  }, [params.id, router]);

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
                      src={profile.profileImage || "https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"}
                      alt="Photo de profil"
                      fill
                      style={{ objectFit: "cover" }}
                      className="shadow-xl rounded-full border-none"
                      priority
                    />
                  </div>
                </div>
              </div>
              {isCurrentUser && (
                <Link href="/ugc/profile/edit">
                  <button
                    style={{ backgroundColor: "#90579F" }}
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
                  {profile.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <FontAwesomeIcon
                        icon={faInstagram as IconProp}
                        size="2x"
                      />
                    </a>
                  )}
                  {profile.socialLinks.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profile.socialLinks.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTiktok as IconProp} size="2x" />
                    </a>
                  )}
                  {profile.socialLinks.pinterest && (
                    <a
                      href={`https://pinterest.com/${profile.socialLinks.pinterest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <FontAwesomeIcon
                        icon={faPinterest as IconProp}
                        size="2x"
                      />
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
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
                    <p className="mb-4 text-lg leading-relaxed text-gray-800">
                      {profile.bio}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center py-4 lg:pt-4 pt-8 border-t border-gray-200">
                <div className="mr-4 p-3 text-center">
                  <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                    {profile.portfolio.contracts}
                  </span>
                  <span className="text-sm text-gray-500">Contrats</span>
                </div>
                <div className="mr-4 p-3 text-center">
                  <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                    {profile.portfolio.photos}
                  </span>
                  <span className="text-sm text-gray-500">Photos</span>
                </div>
                <div className="lg:mr-4 p-3 text-center">
                  <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                    {profile.portfolio.comments}
                  </span>
                  <span className="text-sm text-gray-500">Commentaires</span>
                </div>
              </div>
              {isCurrentUser && (
                <div className="mt-10 border-t border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-800 text-center my-6">
                    Mes candidatures récentes
                  </h2>
                  <div className="px-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                      {candidatures.slice(0, 3).map((candidature) => (
                        <div
                          key={candidature._id}
                          className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-center mb-4">
                              <div className="relative w-16 h-16 mr-4">
                                <Image
                                  src={candidature.offerInfo.entrepriseInfo.logo || "/img/default-company.png"}
                                  alt={`Logo de ${candidature.offerInfo.entrepriseInfo.name}`}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {candidature.offerInfo.name}
                                </h3>
                                <p className="text-gray-600">
                                  {candidature.offerInfo.entrepriseInfo.name}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-gray-600">{candidature.offerInfo.category}</p>
                              <p className="text-purple-600 font-semibold mt-2">
                                {candidature.offerInfo.reward}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <span className={`text-sm font-medium ${getStatusColor(candidature.status)}`}>
                                {getStatusText(candidature.status)}
                              </span>
                              <Link href={`/ugc/offer/${candidature.offerCode}`}>
                                <button
                                  style={{ backgroundColor: "#90579F" }}
                                  className="text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                                >
                                  Voir l&apos;offre
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {candidatures.length > 3 && (
                      <div className="text-center mb-8">
                        <Link href="/ugc/candidatures">
                          <button
                            style={{ backgroundColor: "#90579F" }}
                            className="text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                          >
                            Voir toutes mes candidatures
                          </button>
                        </Link>
                      </div>
                    )}
                    {candidatures.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          Vous n&apos;avez pas encore postulé à des offres.
                        </p>
                        <Link href="/ugc/offers">
                          <button
                            style={{ backgroundColor: "#90579F" }}
                            className="text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 mt-4"
                          >
                            Voir les offres disponibles
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Navbar />

      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={profile.profileImage} 
                sx={{ width: 100, height: 100, mr: 3 }}
              />
              <Box>
                <Typography variant="h4">{profile.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {profile.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.location}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={profile.averageRating} readOnly precision={0.5} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({profile.averageRating.toFixed(1)})
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {profile.bio}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Compétences:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.skills.map((skill, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {skill}
                  </Box>
                ))}
              </Box>
            </Box>
            {profile.socialLinks && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Liens:</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {profile.socialLinks.portfolio && (
                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                      Portfolio
                    </a>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Collaborations Récentes
        </Typography>
        <Grid container spacing={3}>
          {collaborations.map((collab) => (
            <Grid item xs={12} key={collab._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {collab.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {collab.description}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Complétée le: {new Date(collab.completedAt).toLocaleDateString()}
                  </Typography>
                  {collab.entrepriseRating && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Évaluation de l&apos;entreprise:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={collab.entrepriseRating.logo} 
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1">
                            {collab.entrepriseRating.name}
                          </Typography>
                          <Rating 
                            value={collab.entrepriseRating.rating} 
                            readOnly 
                            precision={0.5} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {collab.entrepriseRating.comment}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {collaborations.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center">
                Aucune collaboration pour le moment.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
}
