"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Navbar from "@/app/components/navbar";
import TopBar from "@/app/components/topBar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

interface Entreprise {
  code: string;
  name: string;
  description: string;
  category: string;
  location: string;
  siret: string;
  logo: string;
  website?: string;
  stats: {
    offersPublished: number;
    activeOffers: number;
    totalCandidates: number;
  };
}

interface Offer {
  name: string;
  category: string;
  description: string;
  reward: string;
  createdAt: string;
  code: string;
}

export default function Entreprise({ params }: { params: { id: string } }) {
  const [entrepriseData, setEntrepriseData] = useState<Entreprise | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données de l'entreprise
        const response = await fetch(`/api/entreprise?id=${params.id}`);
        const data = await response.json();
        
        if (!data || !data.code) {
          // Si le profil n'existe pas, on récupère le profil courant qui sera créé par défaut
          const currentResponse = await fetch("/api/entreprise/current");
          if (currentResponse.ok) {
            const currentData = await currentResponse.json();
            setEntrepriseData(currentData);
          }
        } else {
          setEntrepriseData(data);
        }

        // Récupérer les offres de l'entreprise
        const offersResponse = await fetch(`/api/offersentreprise?id=${params.id}`);
        if (offersResponse.ok) {
          const offersData = await offersResponse.json();
          setOffers(offersData);
        }

        // Vérifier si c'est le profil de l'utilisateur courant
        const currentResponse = await fetch("/api/entreprise/current");
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          setIsCurrentUser(currentData.code === params.id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    fetchData();
  }, [params.id]);

  if (!entrepriseData) {
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
      <section className="pt-16 mb-24">
        <div className="w-full lg:full px-4 mx-auto">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 flex justify-center">
                  <div className="relative w-40 h-40 -mt-16">
                    <Image
                      src={entrepriseData.logo || "https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"}
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
                    <FontAwesomeIcon icon={faPencilAlt as IconProp} />
                  </button>
                </Link>
              )}
              <div className="text-center mt-12">
                <h3 className="text-4xl font-semibold leading-normal mb-2 text-gray-800">
                  {entrepriseData.name}
                </h3>

                <div className="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold uppercase">
                  <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-500"></i>
                  {entrepriseData.location}
                </div>

                <div className="mb-2 text-gray-700 mt-4">{entrepriseData.category}</div>
                
                {entrepriseData.website && (
                  <a
                    href={entrepriseData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                  >
                    {entrepriseData.website}
                  </a>
                )}

                <div className="flex justify-center py-4 lg:pt-4 pt-8">
                  <div className="mr-4 p-3 text-center">
                    <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                      {entrepriseData.stats.offersPublished}
                    </span>
                    <span className="text-sm text-gray-500">Offres publiées</span>
                  </div>
                  <div className="mr-4 p-3 text-center">
                    <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                      {entrepriseData.stats.activeOffers}
                    </span>
                    <span className="text-sm text-gray-500">Offres actives</span>
                  </div>
                  <div className="lg:mr-4 p-3 text-center">
                    <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                      {entrepriseData.stats.totalCandidates}
                    </span>
                    <span className="text-sm text-gray-500">Candidatures</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 py-10 border-t border-gray-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-gray-800">
                      {entrepriseData.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 text-center my-6">
                  Offres en cours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                  {offers.map((offer) => (
                    <div
                      key={offer.code}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {offer.name}
                        </h3>
                        <p className="text-gray-600 mb-2">{offer.category}</p>
                        <p className="text-gray-500 text-sm mb-4">
                          {offer.description.substring(0, 150)}...
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-600 font-semibold">
                            {offer.reward}
                          </span>
                          <Link href={`/entreprise/offers/${offer.code}`}>
                            <button
                              style={{ backgroundColor: "#90579F" }}
                              className="text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                            >
                              Voir détails
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
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
