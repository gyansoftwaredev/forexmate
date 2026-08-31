/**
 * Converts a numerical INR amount to words in the Indian numbering format (Crore, Lakh, Thousand, Hundred).
 * Example: 84130 -> "Eighty Four Thousand One Hundred Thirty only"
 */
export function numberToWordsINR(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '';
  
  const ones = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const formatted = ('000000000' + Math.floor(num)).slice(-9);
  const match = formatted.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!match) return '';

  let str = '';
  str += Number(match[1]) !== 0 ? (ones[Number(match[1])] || tens[Number(match[1][0])] + ' ' + ones[Number(match[1][1])]) + 'Crore ' : '';
  str += Number(match[2]) !== 0 ? (ones[Number(match[2])] || tens[Number(match[2][0])] + ' ' + ones[Number(match[2][1])]) + 'Lakh ' : '';
  str += Number(match[3]) !== 0 ? (ones[Number(match[3])] || tens[Number(match[3][0])] + ' ' + ones[Number(match[3][1])]) + 'Thousand ' : '';
  str += Number(match[4]) !== 0 ? (ones[Number(match[4])] || tens[Number(match[4][0])] + ' ' + ones[Number(match[4][1])]) + 'Hundred ' : '';
  
  const lastTwo = Number(match[5]);
  if (lastTwo !== 0) {
    str += (str !== '' ? '' : '') + (ones[lastTwo] || tens[Number(match[5][0])] + ' ' + ones[Number(match[5][1])]);
  }

  const result = str.replace(/\s+/g, ' ').trim();
  return result ? `${result} only` : '';
}
