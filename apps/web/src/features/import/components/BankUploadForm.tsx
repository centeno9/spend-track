"use client";

import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useImportStore } from "../providers/import.provider";
import { useExtractPdf } from "../hooks/useExtractPdf";
import { ImportExpense } from "../domain/import-expense";
import { SUPPORTED_BANKS } from "../types/import.types";

export function BankUploadForm() {
  const bank = useImportStore((state) => state.bank);
  const file = useImportStore((state) => state.file);
  const status = useImportStore((state) => state.status);
  const errorMessage = useImportStore((state) => state.errorMessage);
  const setBank = useImportStore((state) => state.setBank);
  const setFile = useImportStore((state) => state.setFile);
  const setStatus = useImportStore((state) => state.setStatus);
  const setError = useImportStore((state) => state.setError);
  const setExpenses = useImportStore((state) => state.setExpenses);

  const extractPdf = useExtractPdf();
  const isExtracting = status === "extracting";

  const handleExtract = async () => {
    if (!file) return;

    setError(null);
    setStatus("extracting");

    try {
      const result = await extractPdf.mutateAsync({ file, bank });
      const expenses = result.cargos.map((cargo, index) =>
        ImportExpense.fromExtractorCargo(cargo, index)
      );

      if (expenses.length === 0) {
        setError(
          "No charges were found in this statement. Double-check the bank and file."
        );
        setStatus("error");
        return;
      }

      setExpenses(expenses);
      setStatus("ready");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to extract the PDF"
      );
      setStatus("error");
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      {/* Bank selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Bank</p>
        <p className="text-xs text-gray-500">
          Only Mexican credit-card statements are supported. More banks coming
          soon.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {SUPPORTED_BANKS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => option.enabled && setBank(option.id)}
              disabled={!option.enabled || isExtracting}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                bank === option.id
                  ? "border-transparent bg-gray-900 text-white shadow-sm"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white",
                !option.enabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {option.label}
              {!option.enabled && (
                <span className="ml-1 text-[10px] uppercase tracking-wide">
                  soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* File upload */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Statement (PDF)</p>
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center transition-colors cursor-pointer hover:border-gray-300",
            isExtracting && "opacity-50 pointer-events-none"
          )}
        >
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={isExtracting}
            onChange={(event) => {
              setError(null);
              setStatus("idle");
              setFile(event.target.files?.[0] ?? null);
            }}
          />
          {file ? (
            <span className="flex items-center gap-2 text-sm text-gray-900">
              <FileText size={18} />
              {file.name}
            </span>
          ) : (
            <>
              <Upload size={22} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                Click to choose a PDF statement
              </span>
            </>
          )}
        </label>
      </div>

      {errorMessage && status === "error" && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <Button
        onClick={handleExtract}
        disabled={!file || isExtracting}
        className="w-full bg-gray-900 hover:bg-black text-white"
      >
        {isExtracting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Extracting...
          </>
        ) : (
          "Extract expenses"
        )}
      </Button>
    </div>
  );
}
