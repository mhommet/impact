'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

export default function TestImage({ params }: { params: { id: string } }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directUrl, setDirectUrl] = useState<string>(`/api/offers/media/binary/${params.id}`);
  const [rawUrl, setRawUrl] = useState<string>(`/api/offers/media/raw/${params.id}`);

  useEffect(() => {
    const fetchDataUrl = async () => {
      try {
        const response = await fetch(`/api/offers/media/base64/${params.id}`);
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.text();
        setDataUrl(data);
      } catch (err) {
        console.error('Erreur lors de la récupération de l&apos;URL de données:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchDataUrl();
  }, [params.id]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test d&apos;affichage d&apos;image</h1>
      <p className="mb-4">ID de l&apos;image: {params.id}</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Méthode 1: URL directe</h2>
        <div className="border p-4 rounded-lg">
          <Image
            src={directUrl}
            alt="Image depuis l'URL directe"
            className="max-w-full h-auto rounded-lg"
            onError={() =>
              setError('Erreur lors du chargement de l&apos;image depuis l&apos;URL directe')
            }
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Méthode 2: URL de données (Data URL)</h2>
        {loading ? (
          <p>Chargement de l&apos;URL de données...</p>
        ) : error ? (
          <p className="text-red-500">Erreur: {error}</p>
        ) : dataUrl ? (
          <div className="border p-4 rounded-lg">
            <Image
              src={dataUrl}
              alt="Image depuis l'URL de données"
              className="max-w-full h-auto rounded-lg"
              onError={() =>
                setError('Erreur lors du chargement de l&apos;image depuis l&apos;URL de données')
              }
            />
          </div>
        ) : (
          <p>Aucune donnée reçue</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Méthode 3: URL brute</h2>
        <div className="border p-4 rounded-lg">
          <Image
            src={rawUrl}
            alt="Image depuis l'URL brute"
            className="max-w-full h-auto rounded-lg"
            onError={() =>
              setError('Erreur lors du chargement de l&apos;image depuis l&apos;URL brute')
            }
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Méthode 4: Iframe avec URL brute</h2>
        <div className="border p-4 rounded-lg">
          <iframe
            src={rawUrl}
            className="w-full h-64 border-0"
            title="Image dans iframe (brute)"
          ></iframe>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Informations de débogage</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>URL directe: {directUrl}</p>
          <p>URL brute: {rawUrl}</p>
          <p>URL de données: {dataUrl ? `${dataUrl.substring(0, 50)}...` : 'Non disponible'}</p>
          <p>Statut: {loading ? 'Chargement...' : error ? `Erreur: ${error}` : 'Chargé'}</p>
        </div>
      </div>
    </div>
  );
}
