"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useImportStore } from "../providers/import.provider";

export function ImportSuccess() {
  const count = useImportStore((state) => state.expenses.length);
  const reset = useImportStore((state) => state.reset);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
      <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        Expenses imported
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        {count} expense{count === 1 ? "" : "s"} added to your account.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={reset}>
          Import another
        </Button>
        <Button asChild className="bg-gray-900 hover:bg-black text-white">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
