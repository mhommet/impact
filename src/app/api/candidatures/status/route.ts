import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function PUT(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { payload } = await jwtVerify(token, secretKey);
    if (payload.type !== "entreprise") {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const { candidatureId, status } = await req.json();

    if (!candidatureId || !status) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("impact");

    // Convertir l'ID en ObjectId
    const objectId = new ObjectId(candidatureId);

    const result = await db.collection("candidatures").updateOne(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new NextResponse("Candidature non trouvée", { status: 404 });
    }

    return NextResponse.json({ message: "Statut mis à jour avec succès" });
  } catch (e) {
    console.error(e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 