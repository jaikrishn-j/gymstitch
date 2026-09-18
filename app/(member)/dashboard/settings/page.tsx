import React from "react";
import { Settings } from "lucide-react";

import { getWeightGoal } from "./actions";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage() {
  const data = await getWeightGoal();

  return (
    <main className="w-full min-h-screen bg-background pb-12">
      <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your fitness goals and preferences.
              </p>
            </div>
          </div>
        </div>

        <SettingsContent data={data} />
      </div>
    </main>
  );
}
