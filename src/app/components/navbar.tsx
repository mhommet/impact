import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChartLine,
  faHome,
  faMessage,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [path, setPath] = useState("");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  if (path.startsWith("/ugc")) {
    return (
      <div
        className="fixed z-50 h-20 w-screen bottom-0"
        style={{
          background: "linear-gradient(to right, #0D1828, rgb(88, 45, 100))",
        }}
      >
        <div className="grid h-full grid-cols-5 justify-center items-center">
          <Link href="/ugc/offers">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faHome} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faCalendar} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faMessage} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faUser} />
            </span>
          </Link>
        </div>
      </div>
    );
  } else if (path.startsWith("/entreprise")) {
    return (
      <div
        className="fixed z-50 h-20 w-screen bottom-0"
        style={{
          background: "linear-gradient(to right, #0D1828, rgb(88, 45, 100))",
        }}
      >
        <div className="grid h-full grid-cols-5 justify-center items-center">
          <Link href="/entreprise/offers">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faHome} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faCalendar} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faChartLine} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faMessage} />
            </span>
          </Link>

          <Link href="/construction">
            <span className="icon text-3xl flex justify-center text-white">
              <FontAwesomeIcon icon={faUser} />
            </span>
          </Link>
        </div>
      </div>
    );
  }
}
