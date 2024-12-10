import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI || '');
const JWT_SECRET = process.env.JWT_SECRET; // Utilisation sécurisée de la clé JWT

export async function POST(req: Request) {
    try {
        const body = await req.json(); // Récupère les données du body
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
        }

        // Détermine le type à partir de l'URL
        const type = req.url && req.url.includes('/ugc/login') ? 'ugc' : 'entreprise';

        // Connexion à MongoDB
        await client.connect();
        const db = client.db('impact');
        const usersCollection = db.collection('users');

        // Vérifie si l'utilisateur existe
        const user = await usersCollection.findOne({ email, type });
        if (!user) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect ou type non valide.' },
                { status: 401 }
            );
        }

        // Vérifie le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
        }

        // Vérifie si le secret JWT est défini
        if (!JWT_SECRET) {
            return NextResponse.json({ error: 'JWT secret is not defined.' }, { status: 500 });
        }

        // Génère un token JWT
        const token = jwt.sign({ userId: user._id, type: user.type }, JWT_SECRET, {
            expiresIn: '1h',
        });

        return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
