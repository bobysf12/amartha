export function delay(ms: number = 500): Promise<void> {
	return new Promise((resolve) => {
		window.setTimeout(() => {
			resolve();
		}, ms);
	});
}
