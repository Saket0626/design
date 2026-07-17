/**
 * @typedef {import("../types").StyleCategory} StyleCategory
 */

/**
 * Build a globally unique category URL while retaining the readable slug.
 *
 * @param {Pick<StyleCategory, "id" | "slug">} category
 */
export function categoryPath(category) {
  return `/category/${encodeURIComponent(category.id)}/${encodeURIComponent(category.slug)}`;
}

/**
 * Resolve canonical ID-based routes and unambiguous legacy slug-only routes.
 * Ambiguous legacy slugs must not silently open another designer's category.
 *
 * @param {StyleCategory[]} categories
 * @param {string | undefined} categoryId
 * @param {string | undefined} legacySlug
 */
export function resolveCategory(categories, categoryId, legacySlug) {
  if (categoryId) {
    return categories.find((category) => category.id === categoryId);
  }

  if (!legacySlug) return undefined;

  const matches = categories.filter((category) => category.slug === legacySlug);
  return matches.length === 1 ? matches[0] : undefined;
}
