import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
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

    const { payload } = await jwtVerify(token, secretKey);
    if (payload.type !== "ugc") {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("impact");

    // Récupérer les candidatures avec les informations des offres
    const candidatures = await db.collection("candidatures")
      .aggregate([
        { $match: { ugcId: payload.userId } },
        {
          $lookup: {
            from: "offres",
            localField: "offerCode",
            foreignField: "code",
            as: "offerInfo"
          }
        },
        { $unwind: "$offerInfo" },
        {
          $lookup: {
            from: "entreprise",
            localField: "offerInfo.entrepriseId",
            foreignField: "code",
            as: "entrepriseInfo"
          }
        },
        { $unwind: "$entrepriseInfo" },
        {
          $project: {
            _id: 1,
            status: 1,
            createdAt: 1,
            offerCode: 1,
            "offerInfo.name": 1,
            "offerInfo.category": 1,
            "offerInfo.description": 1,
            "offerInfo.reward": 1,
            "offerInfo.entrepriseInfo": {
              name: "$entrepriseInfo.name",
              logo: "$entrepriseInfo.logo"
            }
          }
        }
      ])
      .toArray();

    return NextResponse.json(candidatures);
  } catch (e) {
    console.error(e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 