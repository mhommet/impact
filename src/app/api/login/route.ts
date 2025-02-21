import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import clientPromise from '@/../lib/mongodb';


const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, type } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
        }

        // Connexion MongoDB
        const client = await clientPromise;
        await client.connect();
        const db = client.db('impact');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email, type });
        if (!user) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
        }

        if (!JWT_SECRET) {
            return NextResponse.json({ error: 'JWT secret is not defined.' }, { status: 500 });
        }

        const token = jwt.sign({ userId: user._id, type: user.type }, JWT_SECRET, {
            expiresIn: '1h',
        });

        // Retourne le token dans un cookie HTTP et l'userId dans la réponse
        const response = NextResponse.json({ 
            success: true,
            userId: user._id,
            token: token
        });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600, // 1 heure
            path: '/',
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
