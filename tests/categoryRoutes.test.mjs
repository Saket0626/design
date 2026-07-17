import assert from "node:assert/strict";
import test from "node:test";
import { categoryPath, resolveCategory } from "../src/lib/categoryRoutes.js";

const categories = [
  { id: "category-a", userId: "designer-a", slug: "modern-rustic" },
  { id: "category-b", userId: "designer-b", slug: "modern-rustic" },
  { id: "category-c", userId: "designer-c", slug: "coastal" },
];

test("category paths use globally unique IDs", () => {
  assert.equal(
    categoryPath(categories[0]),
    "/category/category-a/modern-rustic"
  );
  assert.notEqual(categoryPath(categories[0]), categoryPath(categories[1]));
});

test("canonical routes resolve colliding slugs by category ID", () => {
  assert.equal(
    resolveCategory(categories, "category-a", undefined),
    categories[0]
  );
  assert.equal(
    resolveCategory(categories, "category-b", undefined),
    categories[1]
  );
});

test("legacy routes resolve only globally unambiguous slugs", () => {
  assert.equal(resolveCategory(categories, undefined, "coastal"), categories[2]);
  assert.equal(resolveCategory(categories, undefined, "modern-rustic"), undefined);
});
