export function formatCurrency(amount: string | number): string {
	if (typeof amount === 'string') {
		amount = parseFloat(amount);
		if (isNaN(amount)) {
			throw new Error('Invalid amount');
		}
	}
	amount = amount.toFixed(2); // Ensure two decimal places

	const formatted = `${amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return `Ñ${formatted}`;
}
