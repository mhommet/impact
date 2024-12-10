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
            // Utilise GET pour transmettre le SIRET dans l'URL
            const response = await fetch(`/api/verify-siret?siret=${siret}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setIsSiretVerified(true);
                setMessage('SIRET vérifié avec succès ! Vous pouvez maintenant vous inscrire.');
            } else {
                setMessage(data.error || 'Erreur lors de la vérification.');
            }
        } catch (error) {
            setMessage(`Erreur de connexion avec le serveur : ${error.message}`);
        }
    };

    // Inscription
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, siret }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            } else {
                setMessage(data.error || 'Erreur lors de l\'inscription.');
            }
        } catch (error) {
            setMessage(`Erreur de connexion avec le serveur : ${error.message}`);
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
