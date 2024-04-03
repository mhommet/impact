"use client";
import TopBar from "@/app/components/topBar";
import Image from "next/image";

export default function Construction() {

  return (
    <>
    <TopBar />
    <div className="px-10 min-h-screen flex flex-col justify-center items-center" style={{ background: "linear-gradient(to right, #182F53, #90579F)" }}>
        <Image src="https://www.svgrepo.com/download/362055/cone.svg" width={1000} height={1000} alt="Logo" className="mb-8 h-40" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-700 dark:text-white mb-4">Oops! Cette page est en cours de construction...</h1>
        <p className="text-center text-gray-500 dark:text-gray-300 text-lg md:text-xl lg:text-2xl mb-8">Nous sommes actuellement en train de construire le site. Restez connectés!</p>
        <div className="flex space-x-4">
        <a href="/" className="border-2 border-gray-800 text-black font-bold py-3 px-6 rounded dark:text-white dark:border-white">Revenir à l'accueil</a>
        </div>
    </div>
    </>
  );
}
