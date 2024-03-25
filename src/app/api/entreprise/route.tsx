import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function GET(req: NextRequest) {
  // Getting params
  const seachParams = req.nextUrl.searchParams;
  const id = seachParams.get("id");
  try {
    // Handle missing id
    if (id == 'undefined' || !id) {
      return new NextResponse("No id", { status: 401 });
    }

    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Get all
    const entreprise = await db.collection("entreprise").findOne({ _id: id });
    return NextResponse.json(entreprise);
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 401 });
  }
}

export async function POST(req: NextRequest, res: any) {
  // Getting params
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const description = searchParams.get("description");
  const category = searchParams.get("category");

  try {
    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Finding by id
    const entreprise = await db.collection("entreprise").findOne({ _id: id });
    if (!entreprise) {
      return new NextResponse("Entreprise not found", { status: 401 });
    }

    // Update
    await db.collection("entreprise").updateOne({ _id: id }, { $set: { name: name, description: description, category: category } });
    return NextResponse.json({ message: "Update ok" });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 501 });
  }
}
