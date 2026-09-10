import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "IMGBB_API_KEY missing. Add it to .env.local (get a free key from https://api.imgbb.com/)",
        },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No image file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const body = new FormData();
    body.append("image", base64);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: "POST", body }
    );

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return NextResponse.json(
        { message: data?.error?.message || "ImageBB upload failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: data.data.display_url || data.data.url,
      deleteUrl: data.data.delete_url || null,
    });
  } catch (error) {
    console.error("POST /api/upload failed:", error);
    return NextResponse.json(
      { message: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
