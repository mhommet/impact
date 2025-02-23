import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { siret } = body;

    if (!siret) {
      return NextResponse.json({ error: 'Le SIRET est requis.' }, { status: 400 });
    }

    const token = process.env.INSEE_API_TOKEN;
    const response = await fetch(`https://api.insee.fr/entreprises/sirene/siret/${siret}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Erreur lors de la vérification.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ message: 'SIRET vérifié avec succès.', data }, { status: 200 });
  } catch (error) {
    console.error('Erreur de vérification SIRET :', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
