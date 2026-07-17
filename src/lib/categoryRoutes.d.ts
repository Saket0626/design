import type { StyleCategory } from "../types";

export function categoryPath(
  category: Pick<StyleCategory, "id" | "slug">
): string;

export function resolveCategory(
  categories: StyleCategory[],
  categoryId: string | undefined,
  legacySlug: string | undefined
): StyleCategory | undefined;
