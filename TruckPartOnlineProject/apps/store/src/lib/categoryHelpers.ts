import categories from "./categories";
import type { Category, Subcategory } from "./categories";

/**
 * Helper functions for category formatting and mapping
 * Ensures consistency between static categories and API categories
 */

/**
 * Find a category by its code (A, B, C, etc.)
 */
export function findCategoryByCode(code: string): Category | undefined {
  return categories.find((cat) => cat.code === code.toUpperCase());
}

/**
 * Find a category by its short name
 */
export function findCategoryByShortName(shortName: string): Category | undefined {
  return categories.find(
    (cat) => cat.shortName.toLowerCase() === shortName.toLowerCase()
  );
}

/**
 * Find a category by its full name
 */
export function findCategoryByName(name: string): Category | undefined {
  return categories.find(
    (cat) => 
      cat.name.toLowerCase() === name.toLowerCase() ||
      cat.shortName.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Find a subcategory by its code (A1, B2, etc.)
 */
export function findSubcategoryByCode(code: string): { category: Category; subcategory: Subcategory } | undefined {
  for (const category of categories) {
    const subcategory = category.subcategories.find(
      (sub) => sub.code === code.toUpperCase()
    );
    if (subcategory) {
      return { category, subcategory };
    }
  }
  return undefined;
}

/**
 * Find a subcategory by its short name within a specific category
 */
export function findSubcategoryByShortName(
  categoryCode: string,
  shortName: string
): Subcategory | undefined {
  const category = findCategoryByCode(categoryCode);
  if (!category) return undefined;

  return category.subcategories.find(
    (sub) => sub.shortName.toLowerCase() === shortName.toLowerCase()
  );
}

/**
 * Get display name for a category code
 * Returns the short name for display purposes
 */
export function getCategoryDisplayName(code: string): string {
  const category = findCategoryByCode(code);
  return category?.shortName || code;
}

/**
 * Get display name for a subcategory code
 */
export function getSubcategoryDisplayName(code: string): string {
  const result = findSubcategoryByCode(code);
  return result?.subcategory.shortName || code;
}

/**
 * Format a category name for URL parameters
 * Uses the code (A, B, C) for consistency
 */
export function formatCategoryForUrl(category: Category | string): string {
  if (typeof category === "string") {
    // If it's already a code (single letter), return it
    if (/^[A-H]$/i.test(category)) {
      return category.toUpperCase();
    }
    // Try to find by name and return code
    const found = findCategoryByName(category);
    return found?.code || category;
  }
  return category.code;
}

/**
 * Format a subcategory name for URL parameters
 * Uses the code (A1, B2, etc.) for consistency
 */
export function formatSubcategoryForUrl(subcategory: Subcategory | string): string {
  if (typeof subcategory === "string") {
    // If it's already a code (letter + number), return it
    if (/^[A-H]\d$/i.test(subcategory)) {
      return subcategory.toUpperCase();
    }
    // Try to find by name and return code
    const found = findSubcategoryByCode(subcategory);
    return found?.subcategory.code || subcategory;
  }
  return subcategory.code;
}

/**
 * Parse URL parameter to get category code
 */
export function parseCategoryFromUrl(param: string | null): string | undefined {
  if (!param) return undefined;
  
  // If it's already a code, return it
  if (/^[A-H]$/i.test(param)) {
    return param.toUpperCase();
  }
  
  // Try to find by name
  const found = findCategoryByName(param);
  return found?.code;
}

/**
 * Parse URL parameter to get subcategory code
 */
export function parseSubcategoryFromUrl(param: string | null): string | undefined {
  if (!param) return undefined;
  
  // If it's already a code, return it
  if (/^[A-H]\d$/i.test(param)) {
    return param.toUpperCase();
  }
  
  // Try to find by name
  const found = findSubcategoryByCode(param);
  return found?.subcategory.code;
}

/**
 * Normalize a category name for comparison
 * Removes accents and converts to lowercase
 */
export function normalizeCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim();
}

/**
 * Check if a category name matches a code or name
 */
export function categoryMatches(
  categoryName: string,
  codeOrName: string
): boolean {
  const normalizedInput = normalizeCategoryName(codeOrName);
  const normalizedName = normalizeCategoryName(categoryName);
  
  // Direct match
  if (normalizedName === normalizedInput) return true;
  
  // Check if input is a code
  const categoryByCode = findCategoryByCode(codeOrName);
  if (categoryByCode) {
    return (
      normalizeCategoryName(categoryByCode.name) === normalizedName ||
      normalizeCategoryName(categoryByCode.shortName) === normalizedName
    );
  }
  
  // Check if input matches short name
  const categoryByShortName = findCategoryByShortName(codeOrName);
  if (categoryByShortName) {
    return (
      normalizeCategoryName(categoryByShortName.name) === normalizedName ||
      normalizeCategoryName(categoryByShortName.shortName) === normalizedName
    );
  }
  
  return false;
}

/**
 * Get all category codes as an array
 */
export function getAllCategoryCodes(): string[] {
  return categories.map((cat) => cat.code);
}

/**
 * Get category info with display properties
 */
export interface CategoryInfo {
  code: string;
  name: string;
  shortName: string;
  displayName: string;
  subcategories: {
    code: string;
    name: string;
    shortName: string;
    displayName: string;
  }[];
}

export function getCategoryInfo(code: string): CategoryInfo | undefined {
  const category = findCategoryByCode(code);
  if (!category) return undefined;

  return {
    code: category.code,
    name: category.name,
    shortName: category.shortName,
    displayName: category.shortName,
    subcategories: category.subcategories.map((sub) => ({
      code: sub.code,
      name: sub.name,
      shortName: sub.shortName,
      displayName: sub.shortName,
    })),
  };
}

/**
 * Get all categories formatted for display
 */
export function getAllCategoriesFormatted(): CategoryInfo[] {
  return categories.map((cat) => ({
    code: cat.code,
    name: cat.name,
    shortName: cat.shortName,
    displayName: cat.shortName,
    subcategories: cat.subcategories.map((sub) => ({
      code: sub.code,
      name: sub.name,
      shortName: sub.shortName,
      displayName: sub.shortName,
    })),
  }));
}

export {
  categories,
  type Category,
  type Subcategory,
};
