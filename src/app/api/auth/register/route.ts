import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const USERNAME_RE = /^[a-z0-9_]{3,15}$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, displayName, email, password } = body ?? {};

  if (!username || !displayName || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const normalizedUsername = String(username).toLowerCase().trim();
  const normalizedEmail = String(email).toLowerCase().trim();

  if (!USERNAME_RE.test(normalizedUsername)) {
    return NextResponse.json(
      { error: "Username must be 3-15 characters: lowercase letters, numbers, underscores." },
      { status: 400 }
    );
  }

  if (String(password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: normalizedUsername }, { email: normalizedEmail }] },
  });

  if (existing) {
    return NextResponse.json({ error: "Username or email already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      displayName: String(displayName).trim(),
      email: normalizedEmail,
      passwordHash,
      avatarSeed: normalizedUsername,
    },
    select: { id: true, username: true, displayName: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
