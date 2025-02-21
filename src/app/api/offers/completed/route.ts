import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// Récupérer les offres complétées
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const client = await clientPromise;
      const db = client.db("impact");

      // Récupérer les offres complétées avec leurs notes
      const completedOffers = await db.collection("offers")
        .aggregate([
          {
            $match: {
              entrepriseId: payload.userId,
              status: "completed"
            }
          },
          {
            $lookup: {
              from: "candidatures",
              localField: "code",
              foreignField: "offerCode",
              as: "candidatures"
            }
          },
          {
            $lookup: {
              from: "ugc",
              localField: "candidatures.ugcId",
              foreignField: "code",
              as: "ugcs"
            }
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              completedAt: 1,
              ugcRating: {
                $map: {
                  input: {
                    $filter: {
                      input: "$candidatures",
                      as: "candidature",
                      cond: { $eq: ["$$candidature.status", "completed"] }
                    }
                  },
                  as: "candidature",
                  in: {
                    rating: "$$candidature.ugcRating",
                    comment: "$$candidature.ugcComment",
                    name: {
                      $let: {
                        vars: {
                          ugc: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$ugcs",
                                  as: "ugc",
                                  cond: { $eq: ["$$ugc.code", "$$candidature.ugcId"] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: "$$ugc.name"
                      }
                    },
                    profileImage: {
                      $let: {
                        vars: {
                          ugc: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$ugcs",
                                  as: "ugc",
                                  cond: { $eq: ["$$ugc.code", "$$candidature.ugcId"] }
                                }
                              },
                              0
                            ]
                          }
                        },
                        in: "$$ugc.profileImage"
                      }
                    }
                  }
                }
              }
            }
          },
          {
            $sort: { completedAt: -1 }
          }
        ])
        .toArray();

      return NextResponse.json(completedOffers);
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la récupération des offres complétées:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

// Marquer une offre comme complétée
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const data = await req.json();
      const { offerId } = data;

      if (!offerId) {
        return new NextResponse("ID de l'offre manquant", { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db("impact");

      // Vérifier que l'offre appartient à l'entreprise
      const offer = await db.collection("offers").findOne({
        _id: offerId,
        entrepriseId: payload.userId
      });

      if (!offer) {
        return new NextResponse("Offre non trouvée", { status: 404 });
      }

      // Mettre à jour le statut de l'offre
      await db.collection("offers").updateOne(
        { _id: offerId },
        {
          $set: {
            status: "completed",
            completedAt: new Date().toISOString()
          }
        }
      );

      // Mettre à jour le statut des candidatures associées
      await db.collection("candidatures").updateMany(
        { offerCode: offer.code },
        {
          $set: {
            status: "completed",
            completedAt: new Date().toISOString()
          }
        }
      );

      return NextResponse.json({ message: "Offre marquée comme complétée" });
    } catch (error) {
      return new NextResponse("Token invalide", { status: 401 });
    }
  } catch (e) {
    console.error("Erreur lors de la complétion de l'offre:", e);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
} 