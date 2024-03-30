"use client";
import React, { useEffect, useState } from "react";
import Head from 'next/head';
import Image from 'next/image';
import Navbar from "@/app/components/navbar";
import TopBar from "@/app/components/topBar";

export default function Ugc({ params }: { params: { id: string } }) {
  const [ugc, setUgc] = useState("");
  interface ugc {
    code: string;
    name: string;
    description: string;
  }

  // Getting the profile
    useEffect(() => {
        const fetchUgc = async () => {
            const response = await fetch(`/api/ugc?id=${params.id}`);
            const data = await response.json();
            console.log(data)
            setUgc(data);
        };
        fetchUgc();
    }, [params.id]);
    return (
    <>
      <Head>
        <link rel="stylesheet" href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css" />
        <link rel="stylesheet" href="https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css" />
      </Head>
      <TopBar />
      <section className="pt-16">
        <div className="w-full lg:full px-4 mx-auto shadow-xl">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
            <div className="px-6">
              <div className="flex flex-wrap items-center justify-center">
                <div className="w-full px-4 text-center mt-20">
                  <div className="flex items-center justify-center flex-col min-w-0 break-word">
                    <Image className="w-20 h-20 rounded-full" src='https://images.unsplash.com/photo-1522860747050-bb0c1af38ae9?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' alt='profile' width={500} height={500} />
                  </div>
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-800">
                        22
                      </span>
                      <span className="text-sm text-gray-800">Contrats</span>
                    </div>
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-800">
                        10
                      </span>
                      <span className="text-sm text-gray-800">Photos</span>
                    </div>
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-800">
                        89
                      </span>
                      <span className="text-sm text-gray-800">Commentaires</span>
                    </div>
                  </div>
                </div>
              </div>
              {ugc && typeof ugc === "object" && (
                <>
                  <div className="text-center mt-12">
                    <h2 className="text-xl font-semibold leading-normal mb-2 text-gray-800">
                      {(ugc as ugc)?.name}
                    </h2>
                    <div className="text-sm leading-normal mt-0 mb-2 text-gray-800 font-bold uppercase">
                      <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-800"></i>
                      Paris, France
                    </div>
                    <div className="mb-2 text-gray-800 mt-10">
                      <i className="fas fa-briefcase mr-2 text-lg text-gray-800"></i>
                      Créatrice de contenus UGC
                    </div>
                  </div>
                  <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                    <div className="flex flex-wrap justify-center">
                      <div className="w-full lg:w-9/12 px-4">
                        <p className="mb-4 text-lg leading-relaxed text-gray-800">
                          {(ugc as ugc)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Navbar />
    </>
  );
}
