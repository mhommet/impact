'use client';
import React from "react";
import Image from "next/image";
import logo from "./logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHeart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const redirect = () => {
  window.location.href = "/";
}

const TopBar = () => {
  return (
    <div
      className="sticky top-0 left-0 right-0 text-white px-8 flex items-center justify-between h-20 w-screen z-10"
      style={{ background: "linear-gradient(to right, #182F53, #90579F)" }}
    >
      <Image
        src={logo}
        alt="LOGO"
        className="absolute left-8 w-1/10 h-auto filter invert"
        width={100}
        height={100}
        onClick={redirect}
      />
      <div className="ml-auto flex space-x-4">
        <span className="text-2xl">
          <FontAwesomeIcon icon={faHeart} />
        </span>
        <span className="text-2xl">
          <FontAwesomeIcon icon={faBell} />
        </span>
      </div>
    </div>
  );
};

export default TopBar;
