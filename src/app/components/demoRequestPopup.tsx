import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

interface DemoRequestPopupProps {
  onClose: () => void;
}

const DemoRequestPopup: React.FC<DemoRequestPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const sendEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let target = e.currentTarget;
    target.user_email.value = email;

    emailjs.sendForm('service_1sue7z5', 'template_iu1g8t4', target, '1qOCEgn7w3DjE8ZiZ').then(
      (result: EmailJSResponseStatus) => {
        onClose();
      },
      (error: Error) => {}
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div ref={popupRef} className="mx-5 relative bg-gray-800 rounded-lg p-8">
        <button
          className="absolute top-0 right-0 border-none bg-none text-white text-xl cursor-pointer"
          onClick={onClose}
        >
          <div className="in pr-2">
            <div className="close-button-block">X</div>
            <div className="close-button-block"></div>
          </div>
          <div className="out">
            <div className="close-button-block"></div>
            <div className="close-button-block"></div>
          </div>
        </button>
        <form onSubmit={sendEmail}>
          <input
            value={email}
            name="user_email"
            type="email"
            className="text-white font-medium text-lg bg-transparent border-2 border-gray-600 rounded px-4 py-3 w-full mb-6"
            placeholder="Entrez votre email"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <input
            type="submit"
            value="Faire la demande"
            className="font-semibold text-lg text-white bg-transparent border-2 border-white rounded py-3 px-6 transition-all duration-300 hover:bg-white hover:text-black"
          />
        </form>
      </div>
    </div>
  );
};

export default DemoRequestPopup;
