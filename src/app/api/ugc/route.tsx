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
    const ugc = await db.collection("ugc").findOne({ code: id });
    return NextResponse.json(ugc);
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

  try {
    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db("impact");

    // Update
    await db.collection("ugc").updateOne({ code: id }, { $set: { name: name, description: description } });
    return NextResponse.json({ message: "Update ok" });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 501 });
  }
}
