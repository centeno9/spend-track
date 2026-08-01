import type { CreateExpensePayload } from "@/shared/types/expense.types";

export interface BankOption {
  id: string;
  label: string;
  enabled: boolean;
}

/**
 * Banks shown in the import UI. Only BBVA is currently parseable; the rest are
 * displayed but disabled until the extractor supports them.
 */
export const SUPPORTED_BANKS: BankOption[] = [
  { id: "bbva", label: "BBVA", enabled: true },
  { id: "banamex", label: "Banamex", enabled: false },
  { id: "hsbc", label: "HSBC", enabled: false },
  { id: "banorte", label: "Banorte", enabled: false },
  { id: "nu", label: "Nu", enabled: false },
];

/** A single charge/credit line returned by the PDF extractor service. */
export interface ExtractorCargo {
  fecha_operacion: string;
  fecha_operacion_iso: string | null;
  fecha_cargo: string;
  fecha_cargo_iso: string | null;
  descripcion: string;
  monto: number | null;
  monto_cents: number | null;
  monto_raw: string;
}

/** Full response shape of the PDF extractor `/extract` endpoint. */
export interface ExtractorResponse {
  pago_para_no_generar_intereses: number | null;
  total_cargos_calculado: number;
  match: boolean | null;
  num_cargos: number;
  num_abonos: number;
  cargos: ExtractorCargo[];
  abonos: ExtractorCargo[];
  bank: string;
  filename: string;
  error?: string;
}

export interface BulkCreateExpensesPayload {
  expenses: CreateExpensePayload[];
}
