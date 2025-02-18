import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// Récupérer les candidatures pour une offre
export async function GET(req: NextRequest) {
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

      const searchParams = req.nextUrl.searchParams;
      const offerCode = searchParams.get("offerCode");

      if (!offerCode) {
        return new NextResponse("Code de l'offre manquant", { status: 400 });
      }

      console.log("Recherche des candidatures pour l'offre:", offerCode);

      const client = await clientPromise;
      const db = client.db("impact");

      // Utiliser une agrégation pour joindre les informations UGC
      const candidatures = await db.collection("candidatures")
        .aggregate([
          { $match: { offerCode } },
          {
            $lookup: {
              from: "ugc",
              localField: "ugcId",
              foreignField: "code",
              as: "ugcInfo"
            }
          },
          { $unwind: "$ugcInfo" },
          {
            $project: {
              _id: 1,
              ugcId: 1,
              offerCode: 1,
              status: 1,
              createdAt: 1,
              "ugcInfo.name": 1,
              "ugcInfo.profileImage": 1,
              "ugcInfo.title": 1
            }
          }
        ])
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json(candidatures);
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la récupération des candidatures:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

// Soumettre une nouvelle candidature
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== "ugc") {
        return new NextResponse("Non autorisé - UGC uniquement", { status: 403 });
      }

      const ugcId = payload.userId;
      const data = await req.json();
      const { offerCode } = data;

      if (!offerCode) {
        return new NextResponse("Code de l'offre manquant", { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("impact");

      // Vérifier si l'utilisateur a déjà postulé
      const existingApplication = await db.collection("candidatures").findOne({
        ugcId,
        offerCode
      });

      if (existingApplication) {
        return new NextResponse("Vous avez déjà postulé à cette offre", { status: 400 });
      }

      // Créer la candidature
      const candidature = {
        ugcId,
        offerCode,
        status: "pending", // pending, accepted, rejected
        createdAt: new Date()
      };

      await db.collection("candidatures").insertOne(candidature);

      return NextResponse.json({ message: "Candidature envoyée avec succès" });
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la soumission de la candidature:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 