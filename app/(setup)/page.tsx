import InitialModal from "@/components/Modals/InitialModal";
import { db } from "@/lib/db";
import { initialPofile } from "@/lib/initial-pofile";
import { redirect } from "next/navigation";
const SetupPage = async () => {
  const profile = initialPofile();

  const server = await db.server.findFirst({
    where: { member: { some: { profileId: (await profile).id } } },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
