export const PRICE_OPTIONS = [5, 10, 15, 20] as const;
export type PricePerPage = (typeof PRICE_OPTIONS)[number];

export function calculateAssignmentPrice(pages: number, pricePerPage: number) {
  const selectedPrice = PRICE_OPTIONS.includes(pricePerPage as PricePerPage) ? pricePerPage : 15;
  return Math.max(1, Math.floor(pages)) * selectedPrice;
}
