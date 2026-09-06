import { DataTable } from "./data-table";
import { columns, Staff } from "./columns";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@/types";

type Props = {};

async function getStaff(): Promise<Staff[]> {
  const clerk = await clerkClient();

  const users = await clerk.users.getUserList({
    limit: 100,
  });

  return users.data
    .filter((user) => user.privateMetadata?.role === UserRole.STAFF)
    .map((user) => ({
      id: user.id,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        "Unnamed Staff",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      permission: Array.isArray(user.privateMetadata?.permission)
        ? user.privateMetadata.permission
        : [],
    }));
}

const Page = async (props: Props) => {
  const data = await getStaff();

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage staff members and their permissions.
          </p>
        </div>

        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;