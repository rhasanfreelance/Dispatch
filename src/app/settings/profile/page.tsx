import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditProfileForm from "@/components/EditProfileForm";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, displayName: true, bio: true },
  });

  if (!user) {
    redirect("/login");
  }

  return <EditProfileForm initialDisplayName={user.displayName} initialBio={user.bio} username={user.username} />;
}
