"use client";
import React, { useEffect, useState } from "react";
import "./globals.css";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

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
      console.log(response)
      const data = await response.json();
      setOffers(data);
    };
    fetchOffers();
  }, []);

    return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-5 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="flex justify-between">
            <ul
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.isArray(offers) && offers.length > 0 ? (
                offers.map((offer) => (
                  <li
                    key={offer.id}
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-sm font-medium text-gray-900">
                            {offer.name}
                          </h3>
                        </div>
                        <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 ring-1 ring-inset ring-green-600/20">
                          {offer.category}
                        </span>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          Description : {offer.description}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          Récompense : {offer.reward}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                  <h2 className="text-center text-white text-xl font-semibold">
                    Chargement...
                  </h2>
                  <p className="w-1/3 text-center text-white">
                    Les offres sont en train de charger, cela peut prendre quelques secondes, veuillez garder la page ouverte.
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
      </div>
  );
};

export default App;
