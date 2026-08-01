"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  BankUploadForm,
  ImportPreview,
  ImportStoreProvider,
  ImportSuccess,
  useImportStore,
} from "@/features/import";

function ImportContent() {
  const status = useImportStore((state) => state.status);

  const renderBody = () => {
    if (status === "done") return <ImportSuccess />;
    if (status === "ready" || status === "submitting") return <ImportPreview />;
    return <BankUploadForm />;
  };

  return (
    <div className="p-4 md:p-8 flex-1 max-w-3xl">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Import from PDF</h1>
        <p className="text-sm text-gray-500 mt-1">
          Import expenses from a Mexican credit-card statement (PDF).
        </p>
      </header>

      {renderBody()}
    </div>
  );
}

export default function ImportPage() {
  return (
    <ImportStoreProvider>
      <ImportContent />
    </ImportStoreProvider>
  );
}
