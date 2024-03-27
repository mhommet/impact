import "./home.css";
import Image from "next/image";
import TopBar from "./components/topBar";

const Home: React.FC = () => {
  return (
    <>
      <TopBar />
      <div className="gallery">
        <div className="image-container">
          <a href="/offers">
            <Image src={'/img/ugc.jpg'} alt="ugc" width={1000} height={1000} />
            <h1 className="image-text">UGC</h1>
          </a>
        </div>
        <div className="image-container">
          <a href="/">
            <Image
              src={'/img/entreprise.jpg'}
              alt="entreprise"
              width={1000}
              height={1000}
            />
            <h1 className="image-text">ENTREPRISE</h1>
          </a>
        </div>
      </div>
    </>
  );
};

export default Home;
