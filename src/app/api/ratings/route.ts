import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { Rating, UGCRating, EntrepriseRating } from "@/types/offer";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

interface JWTPayload {
  userId: string;
  type: "entreprise" | "ugc";
}

// Ajouter ou mettre à jour une note
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const { userId, type } = payload as JWTPayload;
      const data = await req.json();
      const { offerId, ugcId, rating, comment } = data;

      if (!offerId || !ugcId || !rating || !comment) {
        return new NextResponse("Données manquantes", { status: 400 });
      }

      if (rating < 1 || rating > 5) {
        return new NextResponse("La note doit être comprise entre 1 et 5", { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("impact");

      const offer = await db.collection("offres").findOne({
        _id: new ObjectId(offerId)
      });

      if (!offer) {
        return new NextResponse("Offre non trouvée", { status: 404 });
      }

      const baseRating: Rating = {
        rating,
        comment,
        createdAt: new Date().toISOString()
      };

      // Si c'est une entreprise qui note un UGC
      if (type === "entreprise") {
        if (offer.entrepriseId !== userId) {
          return new NextResponse("Non autorisé", { status: 403 });
        }

        await db.collection("offres").updateOne(
          { _id: new ObjectId(offerId) },
          { $set: { ugcRating: baseRating } }
        );

        const ugcRating: UGCRating = {
          ...baseRating,
          offerId,
          entrepriseId: userId
        };

        await db.collection("ugc").updateOne(
          { code: ugcId },
          { 
            $push: { 
              "ratings": {
                $each: [ugcRating]
              }
            } 
          }
        );
      }
      // Si c'est un UGC qui note une entreprise
      else if (type === "ugc") {
        if (userId !== ugcId) {
          return new NextResponse("Non autorisé", { status: 403 });
        }

        await db.collection("offres").updateOne(
          { _id: new ObjectId(offerId) },
          { $set: { entrepriseRating: baseRating } }
        );

        const entrepriseRating: EntrepriseRating = {
          ...baseRating,
          offerId,
          ugcId: userId
        };

        await db.collection("entreprises").updateOne(
          { _id: offer.entrepriseId },
          { 
            $push: { 
              "ratings": {
                $each: [entrepriseRating]
              }
            } 
          }
        );
      }

      return NextResponse.json({ message: "Note ajoutée avec succès" });
    } catch (error) {
      console.error("Erreur de token:", error);
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note:", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

// Récupérer les notes pour une offre
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const searchParams = req.nextUrl.searchParams;
      const offerCode = searchParams.get("offerCode");

      if (!offerCode) {
        return new NextResponse("Code de l'offre manquant", { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("impact");

      const candidature = await db.collection("candidatures").findOne({
        offerCode,
        status: "completed"
      });

      if (!candidature) {
        return new NextResponse("Aucune note trouvée", { status: 404 });
      }

      // Récupérer les informations de l'UGC et de l'entreprise
      const ugc = await db.collection("ugc").findOne({ code: candidature.ugcId });
      const entreprise = await db.collection("entreprise").findOne({ code: candidature.entrepriseId });

      return NextResponse.json({
        ugcRating: {
          rating: candidature.ugcRating,
          comment: candidature.ugcComment,
          name: ugc?.name,
          profileImage: ugc?.profileImage
        },
        entrepriseRating: {
          rating: candidature.entrepriseRating,
          comment: candidature.entrepriseComment,
          name: entreprise?.name,
          logo: entreprise?.logo
        }
      });
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la récupération des notes:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 