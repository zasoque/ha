export function formatCurrency(amount: string | number): string {
	const formatted = `${amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return `Ñ${formatted}`;
}
