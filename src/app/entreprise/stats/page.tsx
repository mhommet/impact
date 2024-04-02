"use client";
import "../../globals.css";
import Image from "next/image";
import Navbar from "../../components/navbar";
import TopBar from "../../components/topBar";
import "@fortawesome/fontawesome-svg-core/styles.css";

const Stats = () => {
  return (
    <div>
      <TopBar />

      <div className="relative isolate px-6 pt-5 lg:px-8 mb-40">
        <div className="flex justify-between items-center">
          <h3 className="text-gray-900 text-xl mt-5 mb-5 font-bold">
            Les statistiques de cette annonce
          </h3>
        </div>
        <div className="flex justify-between items-center">
          <Image
            width={1000}
            height={1000}
            className="h-48 w-full object-cover md:w-full"
            src={`/img/stats.jpg`}
            alt="Restaurant image"
          />
        </div>
        <br />
        <h3 className="font-bold text-center text-black">Nombre total d&apos;impressions : <span className="text-green-500">5,773</span></h3>
        <h3 className="font-bold text-center text-black">Nombre total de clics : <span className="text-green-500">3,773</span></h3>
        <h3 className="font-bold text-center text-black">Nombre total de vues : <span className="text-green-500">2,773</span></h3>
      </div>
    </div>
  );
};

export default Stats;
