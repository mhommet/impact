import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("impact");

    // Récupérer les candidatures complétées de l'UGC
    const collaborations = await db.collection("candidatures")
      .aggregate([
        {
          $match: {
            ugcId: params.id,
            status: "completed"
          }
        },
        {
          $lookup: {
            from: "offres",
            localField: "offerCode",
            foreignField: "code",
            as: "offer"
          }
        },
        {
          $lookup: {
            from: "entreprise",
            localField: "entrepriseId",
            foreignField: "code",
            as: "entreprise"
          }
        },
        {
          $project: {
            _id: 1,
            title: { $arrayElemAt: ["$offer.title", 0] },
            description: { $arrayElemAt: ["$offer.description", 0] },
            completedAt: "$completedAt",
            entrepriseRating: {
              rating: "$entrepriseRating",
              comment: "$entrepriseComment",
              name: { $arrayElemAt: ["$entreprise.name", 0] },
              logo: { $arrayElemAt: ["$entreprise.logo", 0] }
            }
          }
        },
        {
          $sort: { completedAt: -1 }
        },
        {
          $limit: 5
        }
      ])
      .toArray();

    if (!collaborations) {
      return NextResponse.json({ message: "Aucune collaboration trouvée" }, { status: 404 });
    }

    return NextResponse.json(collaborations);
  } catch (e) {
    console.error("Erreur lors de la récupération des collaborations:", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
} 