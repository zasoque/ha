export function formatCurrency(amount: string): string {
	const formatted = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	if (formatted.startsWith('0.')) {
		return `${parseInt(formatted.slice(2))}P̃`;
	}

	if (formatted.endsWith('.00')) {
		return `${formatted.slice(0, -3)}Ñ`;
	}

	return `${formatted.slice(0, -3)}Ñ${formatted.slice(-2)}`;
}
