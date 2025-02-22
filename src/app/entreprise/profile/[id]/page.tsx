"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Navbar from "@/app/components/navbar";
import TopBar from "@/app/components/topBar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Rating } from "@mui/material";

interface EntrepriseProfile {
  code: string;
  name: string;
  description: string;
  category: string;
  location: string;
  logo: string;
  website?: string;
  stats: {
    offersPublished: number;
    activeOffers: number;
    totalCandidates: number;
  };
}

interface EntrepriseRating {
  rating: number;
  comment: string;
  createdAt: string;
  ugcInfo: {
    name: string;
    profileImage: string;
    title: string;
  };
}

interface Collaboration {
  _id: string;
  completedAt: string;
  offerName: string;
  ugcInfo: {
    code: string;
    name: string;
    profileImage: string;
    title: string;
  };
}

export default function Entreprise({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<EntrepriseProfile | null>(null);
  const [ratings, setRatings] = useState<EntrepriseRating[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Récupérer le profil de l'entreprise
        const response = await fetch(`/api/entreprise?id=${params.id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du profil");
        }
        const data = await response.json();
        setProfile(data);

        // Vérifier si c'est le profil de l'utilisateur courant
        const storedUserCode = localStorage.getItem("userCode");
        setIsCurrentUser(storedUserCode === params.id);

        // Récupérer les avis (limités aux 5 plus récents)
        const ratingsResponse = await fetch(`/api/ratings?userId=${params.id}&type=entreprise&limit=5`);
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setRatings(ratingsData);
        }

        // Récupérer les collaborations récentes
        const collaborationsResponse = await fetch(`/api/entreprise/${params.id}/collaborations`);
        if (collaborationsResponse.ok) {
          const collaborationsData = await collaborationsResponse.json();
          setCollaborations(collaborationsData);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchProfile();
  }, [params.id]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css"
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
                      src={profile.logo || "https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"}
                      alt="Logo entreprise"
                      fill
                      style={{ objectFit: "cover" }}
                      className="shadow-xl rounded-full border-none"
                      priority
                    />
                  </div>
                </div>
              </div>
              {isCurrentUser && (
                <Link href="/entreprise/profile/edit">
                  <button
                    style={{ backgroundColor: "#90579F" }}
                    className="text-white p-3 rounded-full w-12 h-12 flex items-center justify-center hover:bg-purple-700 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
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

                <div className="mb-2 text-gray-700 mt-4">{profile.category}</div>
                
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                  >
                    {profile.website}
                  </a>
                )}

                <div className="flex justify-center py-4 lg:pt-4 pt-8">
                  <div className="mr-4 p-3 text-center">
                    <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                      {profile.stats.offersPublished}
                    </span>
                    <span className="text-sm text-gray-500">Offres publiées</span>
                  </div>
                  <div className="mr-4 p-3 text-center">
                    <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                      {profile.stats.activeOffers}
                    </span>
                    <span className="text-sm text-gray-500">Offres actives</span>
                  </div>
                  <div className="lg:mr-4 p-3 text-center">
                    <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                      {profile.stats.totalCandidates}
                    </span>
                    <span className="text-sm text-gray-500">Candidatures</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-gray-800">
                      {profile.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section des collaborations récentes */}
              <div className="mt-10 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 text-center my-6">
                  Collaborations Récentes
                </h2>
                <div className="flex flex-wrap gap-6 justify-center px-6">
                  {collaborations && collaborations.length > 0 ? (
                    collaborations.map((collab) => (
                      <div key={collab._id} className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64">
                        <div className="relative w-20 h-20 mb-2">
                          <Image
                            src={collab.ugcInfo.profileImage}
                            alt={collab.ugcInfo.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-center">{collab.ugcInfo.name}</h3>
                        <p className="text-sm text-gray-500 text-center mb-2">{collab.ugcInfo.title}</p>
                        <Link href={`/ugc/profile/${collab.ugcInfo.code}`}>
                          <button
                            style={{ backgroundColor: "#90579F" }}
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
              <div className="mt-10 border-t border-gray-200 pb-10">
                <h2 className="text-2xl font-semibold text-gray-800 text-center my-6">
                  Avis Récents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
                  {ratings && ratings.length > 0 ? (
                    ratings.map((rating, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                          <div className="relative w-12 h-12 mr-4">
                            <Image
                              src={rating.ugcInfo.profileImage}
                              alt={rating.ugcInfo.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{rating.ugcInfo.name}</h3>
                            <p className="text-sm text-gray-500">{rating.ugcInfo.title}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mb-2">
                          <Rating value={rating.rating} readOnly />
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
      {isCurrentUser && <Navbar />}
    </>
  );
}
