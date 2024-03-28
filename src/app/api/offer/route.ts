import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function GET(req: NextRequest, res: any) {
  // Getting params
  const seachParams = req.nextUrl.searchParams;
  const id = seachParams.get("id");
  try {
    if (!id) {
      return new NextResponse("ID not found", { status: 401 });
    }
    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Finding the offer by code
    const offer = await db.collection("offres").findOne({ code: id });
    if (!offer) {
      return new NextResponse("Offer not found", { status: 401 });
    }

    // Return the offer
    return new NextResponse(JSON.stringify(offer), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse("An error occured", { status: 500 });
  }
}
