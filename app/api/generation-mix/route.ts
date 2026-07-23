import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // e.g. "2026-07-22"

  const res = await fetch(
    `https://servicebus.ren.pt/datahubapi/electricity/ElectricityProductionBreakdownDaily?culture=en-US&date=${date}`
  );

  if (!res.ok) {
    return NextResponse.json({ error: "REN API error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}