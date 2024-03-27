import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faHome,
  faMessage,
  faPerson,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  return (
    <div className="fixed z-50 h-20 w-screen bottom-0 border border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-800 via-purple-700 to-purple-500">
      <div className="grid h-full grid-cols-5 justify-center items-center">
        <span className="icon text-3xl flex justify-center text-white">
          <FontAwesomeIcon icon={faHome} />
        </span>
        <span className="icon text-3xl flex justify-center text-white">
          <FontAwesomeIcon icon={faCalendar} />
        </span>
        <span className="icon text-3xl flex justify-center text-white">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <span className="icon text-3xl flex justify-center text-white">
          <FontAwesomeIcon icon={faMessage} />
        </span>
        <span className="icon text-3xl flex justify-center text-white">
          <FontAwesomeIcon icon={faUser} />
        </span>
      </div>
    </div>
  );
}
