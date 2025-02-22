"use client";
import TopBar from "@/app/components/topBar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export default function Resources() {
  return (
    <>
      <TopBar />
      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <Link href="/ugc/register">
          <button className="absolute top-5 left-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2">
            <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6 text-gray-600" />
          </button>
        </Link>

        <div className="max-w-3xl mx-auto mt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Comment créer votre micro-entreprise ?
          </h1>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Sites officiels
              </h2>
              <div className="space-y-4">
                <a
                  href="https://www.economie.gouv.fr/cedef/micro-entrepreneur-auto-entrepreneur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2" />
                  Le statut de micro-entrepreneur (auto-entrepreneur)
                </a>
                <a
                  href="https://www.autoentrepreneur.urssaf.fr/portail/accueil/creer-mon-auto-entreprise.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2" />
                  Guide URSSAF : Créer mon auto-entreprise
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Tutoriels vidéo
              </h2>
              <div className="space-y-4">
                <a
                  href="https://www.youtube.com/watch?v=5tdgDKq8PKg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2" />
                  Comment créer une micro-entreprise - Guide complet
                </a>
                <a
                  href="https://www.youtube.com/watch?v=_wr5WdPBHWY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-600 hover:text-purple-800"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 mr-2" />
                  Les étapes pour devenir auto-entrepreneur
                </a>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-gray-700">
                Une fois votre auto-entreprise créée et votre numéro SIRET obtenu, 
                revenez sur notre plateforme pour finaliser votre inscription en tant qu&apos;UGC.
              </p>
              <Link href="/ugc/register">
                <button
                  style={{ backgroundColor: "#90579F" }}
                  className="mt-4 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                >
                  Retour à l&apos;inscription
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 