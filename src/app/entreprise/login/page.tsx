"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Stocker le token dans le localStorage
                const token = data.token;
                document.cookie = `token=${token}; path=/;`;
                localStorage.setItem("token", token);
                
                // Redirection en fonction du type d'utilisateur
                if (window.location.pathname.includes('/ugc')) {
                    router.push('/ugc/offers');
                } else {
                    router.push('/entreprise/offers');
                }
            } else {
                setMessage(data.error || 'Erreur lors de la connexion.');
            }
        } catch (error) {
            setMessage('Erreur de connexion avec le serveur.');
        }
    };

    return (
        <div>
            <h1>Connexion</h1>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Se connecter</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginPage;
