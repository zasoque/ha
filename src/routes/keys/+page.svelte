<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import { generateKeys, toPEM } from '$lib/util/keys';

	async function downloadKeys() {
		const { publicKey, privateKey } = await generateKeys();

		console.log(publicKey, privateKey);

		const publicKeyPEM = await toPEM(publicKey, 'PUBLIC KEY');
		const privateKeyPEM = await toPEM(privateKey, 'PRIVATE KEY');

		const publicBlob = new Blob([publicKeyPEM], { type: 'application/x-pem-file' });
		const privateBlob = new Blob([privateKeyPEM], { type: 'application/x-pem-file' });

		const publicUrl = URL.createObjectURL(publicBlob);
		const privateUrl = URL.createObjectURL(privateBlob);

		const publicLink = document.createElement('a');
		publicLink.href = publicUrl;
		publicLink.download = '인감증명서.pem';
		document.body.appendChild(publicLink);
		publicLink.click();
		document.body.removeChild(publicLink);

		const privateLink = document.createElement('a');
		privateLink.href = privateUrl;
		privateLink.download = '도장.pem';
		document.body.appendChild(privateLink);
		privateLink.click();
		document.body.removeChild(privateLink);
	}

	let verifyData = {
		message: '',
		publicKey: null,
		signature: ''
	};

	async function publicKeyInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		const text = await file.text();

		const base64 = text
			.replace('-----BEGIN PUBLIC KEY-----', '')
			.replace('-----END PUBLIC KEY-----', '')
			.replace(/\s/g, '');

		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		console.log(bytes);

		verifyData.publicKey = await crypto.subtle.importKey(
			'spki',
			bytes.buffer,
			{
				name: 'Ed25519'
			},
			false,
			['verify']
		);
	}

	function base64ToArrayBuffer(base64: string) {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);

		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		return bytes.buffer;
	}

	async function verifySignature() {
		if (!verifyData.publicKey) {
			alert('공개키를 업로드해줘.');
			return;
		}

		const messageBuffer = new TextEncoder().encode(verifyData.message.trim());
		const signatureBuffer = base64ToArrayBuffer(verifyData.signature);

		const isValid = await crypto.subtle.verify(
			{
				name: 'Ed25519'
			},
			verifyData.publicKey,
			signatureBuffer,
			messageBuffer
		);

		if (isValid) {
			alert('서명 검증 성공! 메시지, 공개키, 서명이 일치해.');
		} else {
			alert('서명 검증 실패. 메시지, 공개키, 서명을 다시 확인해줘.');
		}
	}

	let signData = {
		message: '',
		privateKey: null,
		signature: ''
	};

	async function privateKeyInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		const text = await file.text();

		const base64 = text
			.replace('-----BEGIN PRIVATE KEY-----', '')
			.replace('-----END PRIVATE KEY-----', '')
			.replace(/\s/g, '');

		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		signData.privateKey = await crypto.subtle.importKey(
			'pkcs8',
			bytes.buffer,
			{ name: 'Ed25519' },
			false,
			['sign']
		);
	}

	async function signMessage() {
		if (!signData.privateKey) {
			alert('개인키를 업로드해줘.');
			return;
		}

		const messageBuffer = new TextEncoder().encode(signData.message.trim());

		const signatureBuffer = await crypto.subtle.sign(
			{ name: 'Ed25519' },
			signData.privateKey,
			messageBuffer
		);

		const signatureArray = new Uint8Array(signatureBuffer);
		let signatureBase64 = '';
		for (let i = 0; i < signatureArray.length; i++) {
			signatureBase64 += String.fromCharCode(signatureArray[i]);
		}
		signatureBase64 = btoa(signatureBase64);

		signData.signature = signatureBase64;
	}
</script>

<Title>전자서명 검증</Title>
<div>서명 검증</div>
<div>
	<textarea placeholder="메시지 입력" bind:value={verifyData.message}></textarea>
</div>
<div>
	<input type="file" accept=".pem" onchange={publicKeyInput} />
</div>
<div>
	<input type="text" placeholder="서명 입력" bind:value={verifyData.signature} />
</div>
<button onclick={verifySignature}>서명 검증</button>

<Title>전자서명하기</Title>
<div>
	<textarea bind:value={signData.message} placeholder="메시지 입력"></textarea>
</div>
<div>
	<input type="file" accept=".pem" onchange={privateKeyInput} />
</div>
<div>서명: <span class="signature">{signData.signature}</span></div>
<button onclick={signMessage}>메시지 서명하기</button>

<Title>전자서명 발급받기</Title>
<button onclick={downloadKeys}>새로운 전자서명 발급하기</button>

<style>
	div {
		margin: 1em 0;
	}

	textarea {
		width: 100%;
		height: 100px;
		box-sizing: border-box;
	}

	input[type='text'] {
		padding: 0.5em;
		width: 100%;
		box-sizing: border-box;
	}

	.signature {
		display: inline-block;
		margin-top: 0.5em;
		padding: 0.5em;
		background-color: #f0f0f0;
		word-break: break-all;
	}
</style>
