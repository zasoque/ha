class Account {
	id: number;

	constructor(id: number) {
		this.id = id;
	}
}

export function createAccount(row: any[]) {
	console.log(row);
	return new Account(row[0]);
}
