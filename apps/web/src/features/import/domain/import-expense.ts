import type { CreateExpensePayload } from "@/shared/types/expense.types";
import type { ExtractorCargo } from "../types/import.types";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 256;

interface ImportExpenseParams {
  id: string;
  title: string;
  descripcion: string;
  totalCents: number;
  expensedAt: string; // YYYY-MM-DD (local date, no timezone)
  tagIds: string[];
}

/**
 * Domain object representing one charge parsed from a statement, ready to be
 * reviewed/tagged in the preview list and turned into a CreateExpensePayload.
 * Instances are immutable: mutators return a new ImportExpense.
 */
export class ImportExpense {
  readonly id: string;
  readonly title: string;
  readonly descripcion: string;
  readonly totalCents: number;
  readonly expensedAt: string;
  readonly tagIds: string[];

  constructor(params: ImportExpenseParams) {
    this.id = params.id;
    this.title = params.title;
    this.descripcion = params.descripcion;
    this.totalCents = params.totalCents;
    this.expensedAt = params.expensedAt;
    this.tagIds = params.tagIds;
  }

  static fromExtractorCargo(raw: ExtractorCargo, index: number): ImportExpense {
    const descripcion = (raw.descripcion ?? "").trim();
    const title =
      descripcion.replace(/\s+/g, " ").slice(0, MAX_TITLE_LENGTH) ||
      "Untitled charge";

    return new ImportExpense({
      id: String(index),
      title,
      descripcion,
      totalCents: raw.monto_cents ?? 0,
      expensedAt: raw.fecha_operacion_iso ?? "",
      tagIds: [],
    });
  }

  withTitle(title: string): ImportExpense {
    return new ImportExpense({ ...this, title });
  }

  withDate(expensedAt: string): ImportExpense {
    return new ImportExpense({ ...this, expensedAt });
  }

  withTags(tagIds: string[]): ImportExpense {
    return new ImportExpense({ ...this, tagIds: [...tagIds] });
  }

  toggleTag(tagId: string): ImportExpense {
    const tagIds = this.tagIds.includes(tagId)
      ? this.tagIds.filter((id) => id !== tagId)
      : [...this.tagIds, tagId];
    return new ImportExpense({ ...this, tagIds });
  }

  static formatCents(cents: number): string {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(cents / 100);
  }

  formattedTotal(): string {
    return ImportExpense.formatCents(this.totalCents);
  }

  toPayload(): CreateExpensePayload {
    const hasExtraDescription =
      this.descripcion.length > 0 && this.descripcion !== this.title;

    return {
      total: this.totalCents / 100,
      expensedAt: this.expensedAt,
      title: this.title.trim(),
      description: hasExtraDescription
        ? this.descripcion.slice(0, MAX_DESCRIPTION_LENGTH)
        : undefined,
      tagIds: this.tagIds.length > 0 ? this.tagIds : undefined,
    };
  }
}
