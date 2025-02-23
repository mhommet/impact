'use client';

import React from 'react';

import Navbar from '@/app/components/navbar';
import TopBar from '@/app/components/topBar';

export default function MentionsLegales() {
  return (
    <>
      <TopBar />
      <div className="relative isolate px-6 pt-14 lg:px-8 mb-40">
        <div className="mx-auto max-w-4xl py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Mentions Légales</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Informations légales</h2>
            <p className="mb-4">
              Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21
              juin 2004 pour la Confiance dans l&apos;économie numérique, dite L.C.E.N., nous
              portons à la connaissance des utilisateurs et visiteurs du site les informations
              suivantes :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Éditeur du site</h3>
              <p>Impact</p>
              <p>Adresse : 1 rue de la paix, 75000 Paris</p>
              <p>Téléphone : 01 02 03 04 05</p>
              <p>Email : contact@impact.com</p>
              <p>SIRET : 000 000 000 000 00</p>
              <p>Directeur de la publication : Jean Michel</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Hébergement</h2>
            <p className="mb-4">Le site est hébergé par :</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>Vercel</p>
              <p>1 rue de la paix, 75000 Paris</p>
              <p>01 02 03 04 05</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              3. Protection des données personnelles
            </h2>
            <div className="space-y-4">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
                Informatique et Libertés, vous disposez des droits suivants concernant vos données
                personnelles :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Droit d&apos;accès</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d&apos;opposition</li>
              </ul>
              <p>
                Pour exercer ces droits ou pour toute question sur le traitement de vos données,
                vous pouvez nous contacter à l&apos;adresse : [email du DPO/responsable RGPD]
              </p>
              <p>
                Une déclaration a été effectuée auprès de la Commission Nationale de
                l&apos;Informatique et des Libertés (CNIL) sous le numéro : [Numéro de déclaration
                CNIL]
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              4. Propriété intellectuelle
            </h2>
            <p className="mb-4">
              L&apos;ensemble du contenu du site (textes, images, vidéos, etc.) est protégé par le
              droit d&apos;auteur. Toute reproduction, même partielle, est soumise à autorisation
              préalable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Cookies</h2>
            <p className="mb-4">
              Le site utilise des cookies pour améliorer l&apos;expérience utilisateur. En naviguant
              sur le site, vous acceptez l&apos;utilisation de cookies conformément à notre
              politique de confidentialité.
            </p>
            <p>
              Vous pouvez configurer votre navigateur pour refuser les cookies ou être alerté lors
              de leur utilisation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Liens hypertextes</h2>
            <p className="mb-4">
              Le site peut contenir des liens vers d&apos;autres sites. Nous ne sommes pas
              responsables du contenu de ces sites externes ni des pratiques de leurs éditeurs en
              matière de protection des données personnelles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Droit applicable</h2>
            <p className="mb-4">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les
              tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Contact</h2>
            <p className="mb-4">
              Pour toute question concernant ces mentions légales ou l&apos;utilisation du site,
              vous pouvez nous contacter à l&apos;adresse suivante : [email de contact]
            </p>
          </section>

          <div className="mt-8 text-sm text-gray-500">
            <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
}
