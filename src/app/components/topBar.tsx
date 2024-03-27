import React from "react";
import Image from "next/image";
import logo from "./logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHeart } from "@fortawesome/free-solid-svg-icons";
          

const TopBar = () => {
  return (
    <div className="sticky top-0 left-0 right-0 bg-gradient-to-r from-blue-800 via-purple-700 to-purple-500 text-white px-8 flex items-center justify-between h-20 w-screen z-10">
      <Image
        src={logo}
        alt="UGC"
        className="absolute left-8 w-1/10 h-auto filter invert"
        width={100}
        height={100}
      />
      <div className="ml-auto flex space-x-4">
        <span className="text-2xl"><FontAwesomeIcon icon={faHeart} /></span>
        <span className="text-2xl"><FontAwesomeIcon icon={faBell} /></span>
      </div>
    </div>
  );
};

export default TopBar;
