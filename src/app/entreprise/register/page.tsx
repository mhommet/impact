"use client";
import { useState } from 'react';

const RegisterAndVerifyAccount = () => {
    const [siret, setSiret] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSiretVerified, setIsSiretVerified] = useState(false);

    // Vérification du SIRET
    const handleSiretSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            // .env NEXT_PUBLIC_INSEE_API_TOKEN
            const token = process.env.NEXT_PUBLIC_INSEE_API_TOKEN;
            const response = await fetch(`https://api.insee.fr/entreprises/sirene/siret/${siret}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });

            const data = await response.json();

            if (response.ok) {
                setIsSiretVerified(true);
                setMessage('SIRET vérifié avec succès ! Vous pouvez maintenant vous inscrire.');
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
    
        // Détermine le type en fonction de l'URL actuelle
        const type = window.location.pathname.includes('/ugc/register') ? 'ugc' : 'entreprise';
    
        try {
            const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, siret, type }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            } else {
                setMessage(data.error || 'Erreur lors de l\'inscription.');
            }
        } catch (error) {
            setMessage(`Erreur de connexion avec le serveur : ${error}`);
        }
    };
    

    return (
        <div>
            <h1>Inscription et vérification de compte</h1>

            {!isSiretVerified ? (
                <form onSubmit={handleSiretSubmit}>
                    <label>
                        Numéro de SIRET :
                        <input
                            type="text"
                            value={siret}
                            onChange={(e) => setSiret(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Vérifier SIRET</button>
                </form>
            ) : (
                <form onSubmit={handleRegisterSubmit}>
                    <label>
                        Email :
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Mot de passe :
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">S'inscrire</button>
                </form>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterAndVerifyAccount;
