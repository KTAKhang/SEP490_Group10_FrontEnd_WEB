/**
 * Format số lượng sản phẩm (đơn vị kg) với tối đa 2 chữ số thập phân.
 * Backend trả về plannedQuantity, receivedQuantity, onHandQuantity, reservedQuantity đã làm tròn 2 chữ số.
 */
export const formatQuantityKg = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "0,00";
  const num = Number(value);
  return num.toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** Giá trị số đã làm tròn 2 chữ số (dùng cho input/so sánh). */
export const roundQuantityKg = (value) => {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Math.round(Number(value) * 100) / 100;
};
