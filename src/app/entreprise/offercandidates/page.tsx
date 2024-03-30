"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Image from "next/image";
import Navbar from "../../components/navbar";
import TopBar from "../../components/topBar";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Link from "next/link";
import {
  faArrowLeft,
  faSort,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const App = () => {
  const [offers, setOffers] = useState("");
  const [archivedOffers, setArchivedOffers] = useState("");

  interface offer {
    id: string;
    name: string;
    description: string;
    category: string;
    reward: string;
    archived: string;
    title: string;
    type: string;
  }

  // Fetching offers
  useEffect(() => {
    const fetchEntreprise = async () => {
      const responseOffres = await fetch(
        `/api/offersentreprise?id=1`
      );
      const responseArchivedOffres = await fetch(
        `/api/offersentreprise?id=1&archived=true`
      );
      const dataOffres = await responseOffres.json();
      const dataArchivedOffres = await responseArchivedOffres.json();
      setOffers(dataOffres);
      setArchivedOffers(dataArchivedOffres);
    };
    fetchEntreprise();
  }, []);

  return (
    <div>
      <TopBar />
      <div className="relative">
      <Image
            width={100}
            height={100}
            className="h-48 w-full object-cover md:w-full"
            src={`/img/campagnenoel.png`}
            alt="Restaurant image"
          />
          <Link href="/entreprise/offers">
            <button className="absolute top-2.5 left-2.5 bg-gray-400 bg-opacity-70 rounded-full border-0 w-10 h-10 flex items-center justify-center text-lg p-0">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
      </div>
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#182F53] via-[#544697] to-[#90579F] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="flex justify-between items-center pb-5">
          <h3 className="text-gray-900 text-md font-bold w-2/3">
            Découvrez les profils intéressés par votre campagne de Noël
          </h3>
          <button className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-full">
            <span className="text-gray-600">
              <FontAwesomeIcon icon={faSort} />
            </span>{" "}
            Trier
          </button>
        </div>
        <div className="flex justify-between">
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full"
          >
              <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-48 md:h-auto">
                    <Image
                        width={1000}
                        height={1000}
                        className="h-full w-full object-cover object-center md:w-full"
                        style={{ objectPosition: "center 25%" }}
                        src={`/img/maud.png`}
                        alt="Restaurant image"
                    />
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-4">
                      <div>
                        <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                          Maud Martin
                        </div>
                        <div className="mt-2 text-gray-400">
                          
                        </div>
                        <button
                          style={{ backgroundColor: "#90579F" }}
                          className="hover:bg-indigo-700 text-white font-bold py-1 px-2 text-xs rounded-md mt-2"
                        >
                          Découvrir le portfolio
                        </button>
                      </div>
                      <div className="flex flex-col items-center justify-center ml-4 relative">
                        <div className="rounded-full bg-gray-200 border-2 border-purple-600 p-2 w-10 h-10 flex items-center justify-center relative">
                          <FontAwesomeIcon icon={faUser} />
                          <div style={{ backgroundColor: "#90579F" }} className="rounded-full text-white text-xs absolute bottom-0 right-0 mb-[-2] mr-[-2] w-4 h-4 flex items-center justify-center">
                            3
                          </div>
                        </div>
                        <div className="text-xs text-center text-black mt-2">
                          En ligne depuis 25 jours
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-48 md:h-auto">
                      <Image
                        width={1000}
                        height={1000}
                        className="h-full w-full object-cover object-center md:w-full"
                        style={{ objectPosition: "center 25%" }}
                        src={`/img/astrid.png`}
                        alt="Restaurant image"
                      />
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-4">
                      <div>
                        <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                          Astrid Gallet
                        </div>
                        <div className="mt-2 text-gray-400">
                          
                        </div>
                        <button
                          style={{ backgroundColor: "#90579F" }}
                          className="hover:bg-indigo-700 text-white font-bold py-1 px-2 text-xs rounded-md mt-2"
                        >
                          Découvrir le portfolio
                        </button>
                      </div>
                      <div className="flex flex-col items-center justify-center ml-4 relative">
                        <div className="rounded-full bg-gray-200 border-2 border-purple-600 p-2 w-10 h-10 flex items-center justify-center relative">
                          <FontAwesomeIcon icon={faUser} />
                          <div style={{ backgroundColor: "#90579F" }} className="rounded-full text-white text-xs absolute bottom-0 right-0 mb-[-2] mr-[-2] w-4 h-4 flex items-center justify-center">
                            3
                          </div>
                        </div>
                        <div className="text-xs text-center text-black mt-2">
                          En ligne depuis 25 jours
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl lg:max-w-3xl xl:max-w-4xl m-5 w-full">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-48 md:h-auto">
                      <Image
                        width={1000}
                        height={1000}
                        className="h-full w-full object-cover object-center md:w-full"
                        style={{ objectPosition: "center 25%" }}
                        src={`/img/camille.png`}
                        alt="Restaurant image"
                      />
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-4">
                      <div>
                        <div className="uppercase tracking-wide text-sm text-gray-600 font-semibold">
                          Camille Belarbi
                        </div>
                        <div className="mt-2 text-gray-400">
                          
                        </div>
                        <button
                          style={{ backgroundColor: "#90579F" }}
                          className="hover:bg-indigo-700 text-white font-bold py-1 px-2 text-xs rounded-md mt-2"
                        >
                          Découvrir le portfolio
                        </button>
                      </div>
                      <div className="flex flex-col items-center justify-center ml-4 relative">
                        <div className="rounded-full bg-gray-200 border-2 border-purple-600 p-2 w-10 h-10 flex items-center justify-center relative">
                          <FontAwesomeIcon icon={faUser} />
                          <div style={{ backgroundColor: "#90579F" }} className="rounded-full text-white text-xs absolute bottom-0 right-0 mb-[-2] mr-[-2] w-4 h-4 flex items-center justify-center">
                            3
                          </div>
                        </div>
                        <div className="text-xs text-center text-black mt-2">
                          En ligne depuis 25 jours
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
          </ul>
      </div>
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default App;
