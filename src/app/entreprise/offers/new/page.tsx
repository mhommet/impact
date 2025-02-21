"use client";
import React, { useState } from "react";
import "../../../globals.css";
import TopBar from "../../../components/topBar";
import Navbar from "../../../components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function NewOffer() {
  useAuth(); // Vérifie si l'utilisateur est connecté
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    reward: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation côté client
    if (!formData.name || formData.name.length < 3) {
      setError("Le nom de l&apos;offre doit contenir au moins 3 caractères");
      setIsSubmitting(false);
      return;
    }

    if (!formData.category) {
      setError("Veuillez sélectionner une catégorie");
      setIsSubmitting(false);
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      setError("La description doit contenir au moins 10 caractères");
      setIsSubmitting(false);
      return;
    }

    if (!formData.reward) {
      setError("Veuillez indiquer la rémunération proposée");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l&apos;offre");
      }

      router.push("/entreprise/offers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex items-center mb-6">
          <Link href="/entreprise/offers" className="mr-4">
            <button className="bg-gray-200 rounded-full p-2">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Créer une nouvelle offre
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de l&apos;offre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Mode">Mode</option>
              <option value="Beauté">Beauté</option>
              <option value="Sport">Sport</option>
              <option value="Technologie">Technologie</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description du brief
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
              Rémunération proposée
            </label>
            <input
              type="text"
              id="reward"
              name="reward"
              required
              value={formData.reward}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "#90579F" }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? "Publication en cours..." : "Publier l'offre"}
            </button>
          </div>
        </form>
      </div>
      <Navbar />
    </div>
  );
} 