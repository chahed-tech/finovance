import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { capital, debt, liquidity } = await req.json();

  let score = 0;
  if (capital > 100000) score += 30;
  if (debt < 50000) score += 30;
  if (liquidity > 20000) score += 40;

  let riskLevel = "Faible";
  if (score < 50) riskLevel = "Élevé";
  else if (score < 80) riskLevel = "Moyen";

  return NextResponse.json({ score, riskLevel });
}