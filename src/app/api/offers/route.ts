import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      
      // Initialize MongoDB
      const client = await clientPromise;
      const db = client.db("impact");

      // Si c'est une entreprise, on ne renvoie que ses offres
      if (payload.type === "entreprise") {
        const entrepriseId = payload.userId;
        if (!entrepriseId) {
          return new NextResponse("ID entreprise non trouvé", { status: 400 });
        }

        const offers = await db.collection("offres")
          .find({ entrepriseId })
          .sort({ createdAt: -1 })
          .toArray();

        return NextResponse.json(offers);
      }
      
      // Si c'est un UGC, on renvoie toutes les offres non archivées
      if (payload.type === "ugc") {
        const offers = await db.collection("offres")
          .find({ archived: false })
          .sort({ createdAt: -1 })
          .toArray();

        return NextResponse.json(offers);
      }

      return new NextResponse("Type d'utilisateur non autorisé", { status: 403 });
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la récupération des offres:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    let entrepriseId;
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== "entreprise") {
        return new NextResponse("Non autorisé - Entreprises uniquement", { status: 403 });
      }
      // Récupérer l'ID de l'entreprise depuis le token
      entrepriseId = payload.userId;
      if (!entrepriseId) {
        return new NextResponse("ID entreprise non trouvé", { status: 400 });
      }
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }

    // Récupérer les données de l'offre
    const offerData = await req.json();
    
    if (!offerData.name || !offerData.category || !offerData.description || !offerData.reward) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    // Générer un code unique pour l'offre (timestamp + random)
    const code = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Préparer l'objet offre
    const offer = {
      ...offerData,
      code,
      createdAt: new Date(),
      entrepriseId, // Utiliser l'ID récupéré du token JWT
      archived: false
    };

    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Insérer l'offre
    await db.collection("offres").insertOne(offer);
    
    return NextResponse.json({ 
      message: "Offre créée avec succès",
      code 
    }, { status: 201 });
  } catch (e) {
    console.error("Erreur lors de la création de l'offre:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
