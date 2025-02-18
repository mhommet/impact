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

export default function Ugc({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<UgcProfile | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/ugc?id=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          router.push("/404");
        }

        // Vérifier si c'est le profil de l'utilisateur courant
        const storedUserId = localStorage.getItem("userId");
        setIsCurrentUser(storedUserId === params.id);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      }
    };
    fetchProfile();
  }, [params.id, router]);

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
                      {profile.description}
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
            </div>
          </div>
        </div>
      </section>
      <Navbar />
    </>
  );
}
