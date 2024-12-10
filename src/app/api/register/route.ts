import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { email, password, type, entrepriseId, ugcId } = req.body;

    if (!email || !password || !type) {
        return res.status(400).json({ error: 'Email, mot de passe et type sont requis.' });
    }

    try {
        await client.connect();
        const db = client.db('impact');
        const usersCollection = db.collection('users');

        // Vérifiez si l'utilisateur existe déjà
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        // Hachez le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créez l'utilisateur
        const user = {
            email,
            password: hashedPassword,
            type,
            entrepriseId: type === 'entreprise' ? entrepriseId : null,
            ugcId: type === 'ugc' ? ugcId : null,
            isValidated: false,
        };

        await usersCollection.insertOne(user);

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        console.error('Erreur serveur :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
}
