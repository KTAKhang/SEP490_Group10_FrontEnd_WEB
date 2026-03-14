/**
 * Get days until expiry (date-only comparison).
 * @param {Date|String} expiryDate - expiryDateStr (YYYY-MM-DD) or expiryDate
 * @param {Date} [referenceDate] - reference date (default: today)
 * @returns {number|null} Days until expiry (≥0 = not expired, <0 = expired), null if no expiry
 */
export const getDaysUntilExpiry = (expiryDate, referenceDate) => {
  if (expiryDate == null) return null;
  const expiry =
    typeof expiryDate === "string"
      ? new Date(expiryDate + "T12:00:00")
      : new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return null;
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  ref.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - ref.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Check if product is expired (expiryDate <= referenceDate).
 * Prefers product.isExpired from API (backend uses Vietnam timezone) when available.
 * @param {Object} product - { isExpired?, expiryDateStr, expiryDate }
 * @param {Date} [referenceDate] - reference date (default: today) — used when isExpired not from API
 * @returns {boolean}
 */
export const isProductExpired = (product, referenceDate) => {
  if (product == null) return false;
  if (typeof product.isExpired === "boolean") return product.isExpired;
  const daysUntil = getDaysUntilExpiry(
    product?.expiryDateStr ?? product?.expiryDate ?? null,
    referenceDate
  );
  return daysUntil != null && daysUntil < 0;
};
