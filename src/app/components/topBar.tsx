import React from 'react';
import Image from 'next/image';
import logo from './logo.png';

const TopBar = () => {
    return (
        <div className="sticky top-0 left-0 right-0 bg-gradient-to-r from-blue-800 via-purple-700 to-purple-500 text-white px-8 flex items-center justify-between h-20 w-screen z-10">
            <Image src={logo} alt="UGC" className="absolute left-8 w-1/10 h-auto filter invert" layout="fixed" width={100} height={100} />
            <div className="ml-auto flex space-x-4">
                <span className="emoji text-2xl">❤️</span>
                <span className="emoji text-2xl">🔔</span>
            </div>
        </div>
    );
}

export default TopBar;