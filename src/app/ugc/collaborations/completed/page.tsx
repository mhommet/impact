"use client";
import React, { useEffect, useState } from "react";
import TopBar from "@/app/components/topBar";
import Navbar from "@/app/components/navbar";
import Image from "next/image";
import { Rating } from "@mui/material";
import { useRouter } from "next/navigation";

interface Collaboration {
  _id: string;
  title: string;
  description: string;
  completedAt: string;
  offerCode: string;
  entrepriseId: string;
  entrepriseInfo: {
    name: string;
    logo: string;
  };
  entrepriseRating?: {
    rating: number;
    comment: string;
  };
}

export default function CompletedCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: string]: { rating: number; comment: string } }>({});
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const userCode = localStorage.getItem("userCode");
        if (!userCode) {
          router.push("/ugc/login");
          return;
        }

        const response = await fetch(`/api/ugc/${userCode}/collaborations`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des collaborations");
        }
        const data = await response.json();
        setCollaborations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborations();
  }, [router]);

  const handleRatingChange = (collaborationId: string, value: number | null) => {
    setRatings(prev => ({
      ...prev,
      [collaborationId]: {
        ...prev[collaborationId],
        rating: value || 0
      }
    }));
  };

  const handleCommentChange = (collaborationId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [collaborationId]: {
        ...prev[collaborationId],
        comment
      }
    }));
  };

  const submitRating = async (collaboration: Collaboration) => {
    const rating = ratings[collaboration._id];
    if (!rating || !rating.rating || !rating.comment) {
      setError("Veuillez fournir une note et un commentaire");
      return;
    }

    setSubmitting(prev => ({ ...prev, [collaboration._id]: true }));

    try {
      // Log pour déboguer
      console.log("Collaboration complète:", collaboration);
      console.log("Envoi de l'avis avec les données:", {
        offerId: collaboration.offerCode,
        toId: collaboration.entrepriseId,
        rating: rating.rating,
        comment: rating.comment,
        type: "entreprise"
      });

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: collaboration.offerCode,
          toId: collaboration.entrepriseId,
          rating: rating.rating,
          comment: rating.comment,
          type: "entreprise"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi de l'avis");
      }

      // Mettre à jour la liste des collaborations
      setCollaborations(prevCollabs =>
        prevCollabs.map(collab =>
          collab._id === collaboration._id
            ? {
                ...collab,
                entrepriseRating: {
                  rating: rating.rating,
                  comment: rating.comment
                }
              }
            : collab
        )
      );

      // Réinitialiser le formulaire
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[collaboration._id];
        return newRatings;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(prev => ({ ...prev, [collaboration._id]: false }));
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Collaborations Complétées
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {collaborations.map((collaboration) => (
            <div
              key={collaboration._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 mr-4">
                    <Image
                      src={collaboration.entrepriseInfo.logo || "/img/default-company.png"}
                      alt={`Logo de ${collaboration.entrepriseInfo.name}`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {collaboration.title}
                    </h3>
                    <p className="text-gray-600">
                      {collaboration.entrepriseInfo.name}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {collaboration.description}
                </p>

                <div className="text-sm text-gray-500 mt-2">
                  Complétée le {new Date(collaboration.completedAt).toLocaleDateString()}
                </div>

                {collaboration.entrepriseRating ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="font-semibold mb-2">Votre avis :</p>
                    <div className="flex items-center mb-2">
                      <Rating value={collaboration.entrepriseRating.rating} readOnly />
                    </div>
                    <p className="text-gray-600 italic">
                      &ldquo;{collaboration.entrepriseRating.comment}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="font-semibold mb-2">Laisser un avis :</p>
                    <div className="space-y-4">
                      <div>
                        <Rating
                          value={ratings[collaboration._id]?.rating || 0}
                          onChange={(_, value) => handleRatingChange(collaboration._id, value)}
                        />
                      </div>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        placeholder="Votre commentaire..."
                        value={ratings[collaboration._id]?.comment || ""}
                        onChange={(e) => handleCommentChange(collaboration._id, e.target.value)}
                      />
                      <button
                        onClick={() => submitRating(collaboration)}
                        disabled={submitting[collaboration._id]}
                        style={{ backgroundColor: "#90579F" }}
                        className="text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {submitting[collaboration._id] ? "Envoi..." : "Envoyer l'avis"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {collaborations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Vous n&apos;avez pas encore de collaborations complétées.
              </p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </>
  );
} 