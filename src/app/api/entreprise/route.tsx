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
  // Getting params
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  try {
    // Handle missing id
    if (!id) {
      return new NextResponse("No id", { status: 401 });
    }

    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Get all
    const entreprise = await db.collection("entreprise").findOne({ code: id });
    return NextResponse.json(entreprise);
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 401 });
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

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== "entreprise") {
        return new NextResponse("Non autorisé - Entreprises uniquement", { status: 403 });
      }

      const entrepriseId = payload.userId;
      if (!entrepriseId) {
        return new NextResponse("ID entreprise non trouvé", { status: 400 });
      }

      const data = await req.json();
      const client = await clientPromise;
      const db = client.db("impact");

      const updateData = {
        code: entrepriseId, // Utiliser l'ID du token comme code
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        siret: data.siret,
        logo: data.logo,
        website: data.website,
        stats: data.stats || {
          offersPublished: 0,
          activeOffers: 0,
          totalCandidates: 0
        },
        updatedAt: new Date()
      };

      await db.collection("entreprise").updateOne(
        { code: entrepriseId },
        { $set: updateData },
        { upsert: true } // Créer le document s'il n'existe pas
      );

      return NextResponse.json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la mise à jour du profil:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
