import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { OfferStatus } from "@/types/offer";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function PUT(req: NextRequest) {
  try {
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

      const data = await req.json();
      const { offerId, status } = data;

      if (!offerId || !status || !Object.values(OfferStatus).includes(status)) {
        return new NextResponse("Données invalides", { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("impact");

      // Vérifier que l'offre appartient à l'entreprise
      const offer = await db.collection("offres").findOne({
        _id: new ObjectId(offerId),
        entrepriseId: payload.userId
      });

      if (!offer) {
        return new NextResponse("Offre non trouvée", { status: 404 });
      }

      // Mettre à jour le statut
      const updateData: any = {
        status
      };

      // Si l'offre est terminée, ajouter la date de complétion
      if (status === OfferStatus.COMPLETED) {
        updateData.completedAt = new Date().toISOString();
      }

      await db.collection("offres").updateOne(
        { _id: new ObjectId(offerId) },
        { $set: updateData }
      );

      return NextResponse.json({ message: "Statut mis à jour avec succès" });
    } catch (error) {
      console.error("Erreur de token:", error);
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 