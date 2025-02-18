"use client";
import React, { useEffect, useState } from "react";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface Candidature {
  _id: string;
  ugcId: string;
  offerCode: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  ugcInfo: {
    name: string;
    profileImage: string;
    title: string;
  };
}

export default function Candidatures({ params }: { params: { id: string } }) {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        const response = await fetch(`/api/candidatures?offerCode=${params.id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des candidatures");
        }
        const data = await response.json();
        setCandidatures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidatures();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex items-center mb-6">
          <Link href={`/entreprise/offers/${params.id}`} className="mr-4">
            <button className="bg-gray-200 rounded-full p-2">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Candidatures reçues
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {candidatures.map((candidature) => (
            <div
              key={candidature._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 mr-4">
                    <Image
                      src={candidature.ugcInfo.profileImage || "https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"}
                      alt={`Photo de ${candidature.ugcInfo.name}`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {candidature.ugcInfo.name}
                    </h3>
                    <p className="text-gray-600">{candidature.ugcInfo.title}</p>
                    <p className="text-sm text-gray-500">
                      Statut: {candidature.status}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Candidature reçue le{" "}
                    {new Date(candidature.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/ugc/profile/${candidature.ugcId}`}>
                    <button
                      style={{ backgroundColor: "#90579F" }}
                      className="text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                    >
                      Voir le profil
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {candidatures.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                Aucune candidature reçue pour cette offre.
              </p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
} 