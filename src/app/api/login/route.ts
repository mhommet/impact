import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI || '');
const NEXT_PUBLIC_JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Détermine le type à partir de l'URL
    const type = req.url.includes('/ugc/login') ? 'ugc' : 'entreprise';

    try {
        await client.connect();
        const db = client.db('impact');
        const usersCollection = db.collection('users');

        // Vérifiez si l'utilisateur existe
        const user = await usersCollection.findOne({ email, type });
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect ou type non valide.' });
        }

        // Comparez le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
        }

        // Génèrez un token JWT
        const token = jwt.sign({ userId: user._id, type: user.type }, NEXT_PUBLIC_JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
}
