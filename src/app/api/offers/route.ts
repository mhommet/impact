import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function GET(req: NextRequest) {
  // Getting params
  try {
    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Get all offers
    const offers = await db.collection("offres").find({}).toArray();

    return NextResponse.json(offers);
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  // Getting the new offer object from the request body
  const offer = await req.json();

  try {
    if (!offer) {
      return new NextResponse("Missing datas", { status: 400 });
    }
    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Insert the new share object into the database
    await db.collection("offres").insertOne(offer);
    
    return NextResponse.json({ message: "New offer added." });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 501 });
  }
}
