"use client";
import React, { useEffect, useState } from "react";
import "../globals.css";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Navbar from "../components/navbar";
import TopBar from "../components/topBar";
import "@fortawesome/fontawesome-svg-core/styles.css";

const App = () => {
  const [offers, setOffers] = useState("");
  // Getting the user
  const { user } = useUser();

  interface offer {
    id: string;
    name: string;
    description: string;
    category: string;
    reward: string;
  }

  // Fetching offers
  useEffect(() => {
    const fetchOffers = async () => {
      const response = await fetch(`/api/offers`);
      const data = await response.json();
      setOffers(data);
    };
    fetchOffers();
  }, []);

  return (
    <div className="bg-white">
      <TopBar />
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
        <div>
          <h3 className="text-gray-900 text-xl font-bold">
            Les annonces à la une
          </h3>
          <div className="flex items-center justify-between space-x-4 mt-5">
            {Array.isArray(offers) && offers.length > 0 && (
              <>
                <button className="rounded-full text-xl font-bold">&lt;</button>
                <div
                  key={offers[offers.length - 1].code}
                  className="md:flex w-full md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-md mb-10 rounded-md"
                >
                  <div className="md:flex-shrink-0">
                    <Image
                      width={100}
                      height={100}
                      className="h-48 w-full object-cover md:w-48"
                      src={`/img/restaurant${3}.png`}
                      alt="Restaurant image"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-center">
                      <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                        {offers[offers.length - 1].name}
                      </div>
                      <div>
                        <span className="inline-block bg-yellow-200 text-yellow-600 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">
                          <span>⭐</span>
                          <span>⭐</span>
                          <span>⭐</span>
                          <span>⭐</span>
                          <span>⭐</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-gray-400">
                      {offers[offers.length - 1].category}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <button className="bg-purple-800 hover:bg-indigo-700 text-white font-bold py-1 px-2 text-sm rounded-full">
                        Voir le brief
                      </button>
                      <div>
                        {/* Replace with your heart icon */}
                        <span>❤️</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="rounded-full text-xl font-bold">&gt;</button>
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-gray-900 text-xl font-bold">
            Ces annonces qui pourraient vous intéresser...
          </h3>
          <div className="flex items-center justify-between space-x-4 mt-5">
            <button className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-full">
              <span>🔤</span> Trier
            </button>
            <button className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-full">
              <span>🔎</span> Filtrer
            </button>
            <button className="text-black border border-black bg-transparent px-2 py-1 flex items-center rounded-full">
              <span>🌍</span> Me géolocaliser
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto w-full"
          >
            {Array.isArray(offers) && offers.length > 0 ? (
              offers.map((offer, index) => (
                <div
                  key={offer.id}
                  className="mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-full m-5 w-full"
                >
                  <div className="md:flex w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
                    <div className="md:flex-shrink-0">
                      <Image
                        width={100}
                        height={100}
                        className="h-48 w-full object-cover md:w-48"
                        src={`/img/restaurant${index}.png`}
                        alt="Restaurant image"
                      />
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-center">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                          {offer.name}
                        </div>
                        <div>
                          <span className="inline-block bg-yellow-200 text-yellow-600 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">
                            <span>⭐</span>
                            <span>⭐</span>
                            <span>⭐</span>
                            <span>⭐</span>
                            <span>⭐</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-gray-400">{offer.category}</div>
                      <div className="mt-2 flex justify-between items-center">
                        <button className="bg-purple-800 hover:bg-indigo-700 text-white font-bold py-1 px-2 text-sm rounded-full">
                          Voir le brief
                        </button>
                        <div>
                          {/* Replace with your heart icon */}
                          <span>❤️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                <h2 className="text-center text-white text-xl font-semibold">
                  Chargement...
                </h2>
                <p className="w-1/3 text-center text-white">
                  Les offres sont en train de charger, cela peut prendre
                  quelques secondes, veuillez garder la page ouverte.
                </p>
              </div>
            )}
          </ul>
        </div>
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
      <Navbar />
    </div>
  );
};

export default App;
