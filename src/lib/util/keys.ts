export async function generateKeys() {
	const keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);

	const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
	const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

	return { publicKey, privateKey };
}

export async function toPEM(key: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY') {
	const base64Key = btoa(String.fromCharCode(...new Uint8Array(key)));
	const pemKey = `-----BEGIN ${type}-----\n${base64Key.match(/.{1,64}/g)?.join('\n')}\n-----END ${type}-----`;
	return pemKey;
}
