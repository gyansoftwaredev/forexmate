/**
 * Official Indian GST Calculation for Foreign Currency Exchange
 * As per RBI / CGST Rule 32(2)(b) (Slab-based method on gross amount of currency exchanged ACE)
 * 
 * Slabs:
 * 1. Up to ₹1 Lakh: 0.18% of total amount exchanged (Min ₹45, Max ₹180)
 * 2. ₹1 Lakh to ₹10 Lakhs: ₹180 + 0.09% of amount above ₹1 Lakh (Max ₹990)
 * 3. Above ₹10 Lakhs: ₹990 + 0.018% of amount above ₹10 Lakhs (Max ₹10,800)
 */
export function calculateForexGst(amountInr: number): number {
  if (!amountInr || amountInr <= 0) return 0;

  let gst = 0;

  if (amountInr <= 100000) {
    // Up to ₹1 Lakh: 0.18% of total amount exchanged (subject to a minimum of ₹45 and maximum of ₹180)
    const raw = amountInr * 0.0018;
    gst = Math.min(180, Math.max(45, raw));
  } else if (amountInr <= 1000000) {
    // ₹1 Lakh to ₹10 Lakhs: ₹180 plus 0.09% of the amount above ₹1 Lakh (maximum of ₹990)
    const excess = amountInr - 100000;
    const raw = 180 + (excess * 0.0009);
    gst = Math.min(990, raw);
  } else {
    // Above ₹10 Lakhs: ₹990 plus 0.018% of the amount above ₹10 Lakhs (capped at a maximum GST value of ₹10,800)
    const excess = amountInr - 1000000;
    const raw = 990 + (excess * 0.00018);
    gst = Math.min(10800, raw);
  }

  return Math.round(gst);
}
