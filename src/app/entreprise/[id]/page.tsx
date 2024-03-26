"use client";
import React, { useEffect, useState } from "react";
import Head from 'next/head';
import Image from 'next/image';

export default function Entreprise({ params }: { params: { id: string } }) {
  const [entreprise, setEntreprise] = useState("");
  const [offres, setOffres] = useState("");

  interface entreprise {
    name: string;
    description: string;
    category: string;
    code: string;
  }

  // Getting the profile
    useEffect(() => {
        const fetchEntreprise = async () => {
            const response = await fetch(`/api/entreprise?id=${params.id}`);
            const data = await response.json();
            setEntreprise(data);
            const responseOffres = await fetch(`/api/offersentreprise?id=${params.id}`);
            const dataOffres = await responseOffres.json();
            setOffres(dataOffres);
        };
        fetchEntreprise();
    }, [params.id]);
    return (
    <>
      <Head>
        <link rel="stylesheet" href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css" />
        <link rel="stylesheet" href="https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css" />
      </Head>
      <section className="pt-16">
        <div className="w-full lg:full px-4 mx-auto shadow-xl">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
            <div className="px-6">
              <div className="flex flex-wrap items-center justify-center">
                <div className="w-full px-4 text-center mt-20">
                  <div className="flex items-center justify-center flex-col min-w-0 break-word">
                    <Image className="w-20 h-20 rounded-full" src='https://images.unsplash.com/photo-1659968495051-28b6354e67de?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' alt='profile' width={500} height={500} />
                  </div>
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-800">
                        15
                      </span>
                      <span className="text-sm text-gray-800">Offres publiées</span>
                    </div>
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-800">
                        25
                      </span>
                      <span className="text-sm text-gray-800">Commentaires</span>
                    </div>
                  </div>
                </div>
              </div>
              {entreprise && typeof entreprise === "object" && (
                <>
                  <div className="text-center mt-12">
                    <h2 className="text-xl font-semibold leading-normal mb-2 text-gray-800">
                      {entreprise.name}
                    </h2>
                    <div className="text-sm leading-normal mt-0 mb-2 text-gray-800 font-bold uppercase">
                    <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 ring-1 ring-inset ring-green-600/20">
                          {entreprise.category}
                        </span>
                    </div>
                    <div className="mb-2 text-gray-800 mt-10">
                      <i className="fas fa-briefcase mr-2 text-lg text-gray-800"></i>
                      Paris, France
                    </div>
                    <p className="mb-4 text-lg leading-relaxed text-gray-800">
                          {entreprise.description}
                    </p>
                    <br/>
                    <h1 className="mb-4 text-lg leading-relaxed text-gray-800">Mes offres</h1>
                  </div>
                  {Array.isArray(offres) && offres.length > 0 ? (
                offres.map((offre) => (
                    <div key={offre.name} className="mt-10 py-10 border-t border-blueGray-200 text-center">
                    <div className="flex flex-wrap justify-center">
                      <div className="w-full lg:w-9/12 px-4">
                        <h3>Catégorie</h3>
                        <p className="mb-4 text-lg leading-relaxed text-gray-800">
                          {offre.category}
                        </p>
                        <h3>Description</h3>
                        <p className="mb-4 text-lg leading-relaxed text-gray-800">
                          {offre.description}
                        </p>
                        <h3>Récompense</h3>
                        <p className="mb-4 text-lg leading-relaxed text-gray-800">
                          {offre.reward}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                  <h2 className="text-center text-white text-xl font-semibold">
                    Loading...
                  </h2>
                  <p className="w-1/3 text-center text-white">
                    Les offres sont en cours de chargement, veuillez rester sur cette page.
                  </p>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
