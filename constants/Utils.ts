export default {
  money(value: string | number, currency?: string): string {
    if (!value) value = 0;

    let numberValue = typeof value === "number" ? value : parseFloat(value);

    if (!currency) {
      currency = "IDR";
    }

    const isIDR = currency === "IDR" || currency === "Rp";

    numberValue = isIDR ? Math.round(numberValue) : numberValue;

    let val = isIDR ? numberValue.toFixed(0) : String(Math.round(numberValue * 100) / 100)

    const parts = val.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1] || "";

    integerPart = isIDR
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") // ribuan titik
      : integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // ribuan koma

    val = decimalPart && !isIDR
      ? `${integerPart}.${decimalPart}`
      : integerPart;

    return currency.replace(/\./g, "") + " " + val;
  },
  ucwords(str: string): string {
    return str?.replace?.(/\w\S*/g, function (txt) {
      return txt?.charAt?.(0)?.toUpperCase?.() + txt?.substr?.(1)?.toLowerCase?.();
    });
  }
}
