"use client";
import { useState } from 'react';

const RegisterAndVerifyAccount = () => {
    const [siret, setSiret] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSiretVerified, setIsSiretVerified] = useState(false);
    const [messageSuccess, setMessageSuccess] = useState('');

    // Vérification du SIRET
    const handleSiretSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessageSuccess('');
        setMessage('');
    
        try {
            const response = await fetch('/api/verify-siret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ siret }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setIsSiretVerified(true);
                setMessageSuccess('SIRET vérifié avec succès ! Vous pouvez maintenant vous inscrire.');
            } else {
                setMessage(data.error || 'Erreur lors de la vérification.');
            }
        } catch (error) {
            setMessage(`Erreur de connexion avec le serveur : ${error}`);
        }
    };

    // Inscription
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setMessageSuccess('');
        const type = window.location.pathname.includes('/ugc') ? 'ugc' : 'entreprise';
    
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    siret,
                    type,
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
                setMessageSuccess(data.message || 'Inscription réussie !');
                setTimeout(() => {
                    window.location.href = '/entreprise/login';
                }, 2000);
            } else {
                const errorText = await response.text(); // Récupère les erreurs brutes
                setMessage(errorText?.error || 'Erreur lors de l\'inscription.');
            }
        } catch (error) {
            setMessage(`Erreur de connexion avec le serveur : ${error}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold text-center">Inscription et vérification de compte</h1>

                {!isSiretVerified ? (
                    <form onSubmit={handleSiretSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Numéro de SIRET :
                            </label>
                            <input
                                type="text"
                                value={siret}
                                onChange={(e) => setSiret(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Vérifier SIRET
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email :
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Mot de passe :
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            S&apos;inscrire
                        </button>
                    </form>
                )}

                {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
                {messageSuccess && <p className="mt-4 text-sm text-green-600">{messageSuccess}</p>}
            </div>
        </div>
    );
};

export default RegisterAndVerifyAccount;