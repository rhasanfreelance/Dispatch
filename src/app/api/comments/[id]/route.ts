import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) {
    return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "You can only delete your own replies." }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
