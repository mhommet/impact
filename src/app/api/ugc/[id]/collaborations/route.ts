import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { OfferStatus } from "@/types/offer";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("impact");

    // Log pour vérifier l'ID reçu
    console.log("Recherche des collaborations pour l'UGC:", params.id);

    // Vérifier d'abord si on a des candidatures pour cet UGC
    const candidatures = await db.collection("candidatures").find({
      ugcId: params.id
    }).toArray();
    console.log("Candidatures trouvées:", candidatures);

    // Vérifier les candidatures avec le statut COMPLETED
    const completedCandidatures = await db.collection("candidatures").find({
      ugcId: params.id,
      status: OfferStatus.COMPLETED
    }).toArray();
    console.log("Candidatures complétées:", completedCandidatures);

    const collaborations = await db.collection("candidatures")
      .aggregate([
        {
          $match: {
            ugcId: params.id,
            status: "accepted"
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
          $unwind: "$offer"
        },
        {
          $lookup: {
            from: "entreprise",
            localField: "offer.entrepriseId",
            foreignField: "code",
            as: "entrepriseInfo"
          }
        },
        {
          $unwind: "$entrepriseInfo"
        },
        {
          $project: {
            _id: 1,
            title: "$offer.name",
            description: "$offer.description",
            completedAt: "$updatedAt",
            offerCode: 1,
            entrepriseId: "$entrepriseInfo.code",
            entrepriseInfo: {
              name: "$entrepriseInfo.name",
              logo: "$entrepriseInfo.logo",
              code: "$entrepriseInfo.code"
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

    console.log("Résultat final des collaborations:", collaborations);

    return NextResponse.json(collaborations);
  } catch (e) {
    console.error("Erreur lors de la récupération des collaborations:", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
} 