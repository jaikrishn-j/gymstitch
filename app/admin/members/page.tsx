import { DataTable } from "./data-table";
import { columns, Member } from "./columns";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@/types";

type Props = {};

async function getMembers(): Promise<Member[]> {
  const clerk = await clerkClient();

  const users = await clerk.users.getUserList({
    limit: 100,
  });

  return users.data
    .filter((user) => user.privateMetadata?.role === UserRole.MEMBER)
    .map((user) => ({
      id: user.id,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        "Unnamed Member",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      plan: (user.privateMetadata?.currentPlan as string) || "not activated",
    }));
}

const Page = async (props: Props) => {
  const data = await getMembers();

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Members
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage gym members and their subscriptions.
          </p>
        </div>

        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;
