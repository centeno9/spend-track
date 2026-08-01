import { useMutation } from "@tanstack/react-query";
import { extractPdf } from "../api/import.api";

/**
 * Hook to send a statement PDF to the extractor service and get back the
 * parsed charges.
 */
export function useExtractPdf() {
  return useMutation({
    mutationFn: ({ file, bank }: { file: File; bank: string }) =>
      extractPdf(file, bank),
  });
}
