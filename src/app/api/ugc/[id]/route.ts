import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("impact");

    const ugc = await db.collection("ugc").findOne({ 
      _id: new ObjectId(params.id)
    });

    if (!ugc) {
      return NextResponse.json({ message: "Profil UGC non trouvé" }, { status: 404 });
    }

    return NextResponse.json(ugc);
  } catch (e) {
    console.error("Erreur lors de la récupération du profil UGC:", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
} 