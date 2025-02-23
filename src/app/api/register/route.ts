import bcrypt from 'bcrypt';

import { NextResponse } from 'next/server';

import clientPromise from '../../../../lib/mongodb';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Récupère les données JSON du body
    const { email, password, siret, type } = body;

    if (!email || !password || !siret || !type) {
      return NextResponse.json(
        { error: 'Email, mot de passe et SIRET sont requis.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('impact');
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      siret,
      type,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(user);

    return NextResponse.json({ message: 'Utilisateur créé avec succès.' }, { status: 201 });
  } catch (error) {
    console.error('Erreur serveur :', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
