export function formatCurrency(amount: string): string {
	const formatted = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	if (formatted.endsWith('.00')) {
		return `금${formatted.slice(0, -3)}임정`;
	}
	return `금${formatted.slice(0, -3)}임${formatted.slice(-2)}패`;
}
