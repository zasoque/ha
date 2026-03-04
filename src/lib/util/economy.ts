export function formatCurrency(amount: string | number): string {
	if (typeof amount === 'number') {
		amount = amount.toPrecision(2);
	} else if (typeof amount === 'string') {
		const num = parseFloat(amount);
		if (isNaN(num)) {
			throw new Error('Invalid amount');
		}
		amount = num.toPrecision(2);
	}

	const formatted = `${amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return `Ñ${formatted}`;
}
