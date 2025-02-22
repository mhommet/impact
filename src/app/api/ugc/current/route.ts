export const dynamic = 'force-dynamic';

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

const DEFAULT_PROFILE_IMAGE = "https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png";

export async function GET(req: NextRequest) {
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
      if (!ugcId) {
        return new NextResponse("ID UGC non trouvé", { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("impact");

      // Chercher le profil ou en créer un nouveau s'il n'existe pas
      let ugc = await db.collection("ugc").findOne({ code: ugcId });
      
      if (!ugc) {
        // Créer un profil par défaut
        const newUgc = {
          _id: new ObjectId(),
          code: ugcId,
          name: "",
          description: "",
          location: "",
          title: "",
          profileImage: DEFAULT_PROFILE_IMAGE,
          socialLinks: {},
          portfolio: {
            contracts: 0,
            photos: 0,
            comments: 0
          },
          createdAt: new Date()
        };
        
        await db.collection("ugc").insertOne(newUgc);
        ugc = newUgc;
      }

      return NextResponse.json(ugc);
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la récupération du profil:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 