import React from "react";
import { ReceiptText } from "lucide-react";

import { getMemberTransactions } from "../actions";
import { TransactionsTable } from "./transactions-table";

export default async function TransactionsPage() {
  const transactions = await getMemberTransactions();

  return (
    <main className="w-full min-h-screen bg-background pb-12">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60">
              <ReceiptText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Transactions
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Click on any row to view full transaction details.
              </p>
            </div>
          </div>
        </div>

        <TransactionsTable transactions={transactions} />
      </div>
    </main>
  );
}
