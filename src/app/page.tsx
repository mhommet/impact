import './home.css';
import ugc from './ugc.jpg';
import entreprise from './entreprise.jpg';
import Image from 'next/image';

const Home: React.FC = () => {
    return (
        <div className="gallery">
            <div className="image-container">
                <a href="/ugc">
                    <Image src={ugc.src} alt="ugc" width={1000} height={1000} />
                    <h1 className="image-text">UGC</h1>
                </a>
            </div>
            <div className="image-container">
                <a href="/entreprise">
                    <Image src={entreprise.src} alt="entreprise" width={1000} height={1000} />
                    <h1 className="image-text">ENTREPRISE</h1>
                </a>
            </div>
        </div>
    );
}

export default Home;