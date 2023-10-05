export function dateMessage(updateDate: string): string {
	if (!updateDate) return 'n/a';
	const now = new Date();
	const then = new Date(updateDate.replaceAll('-', '/'));
	now.setHours(0, 0, 0);
	then.setHours(0, 0, 0);
	const oneDay = 24 * 60 * 60 * 1000;
	const diffDays = Math.round(Math.abs((now.getTime() - then.getTime()) / oneDay));
	if (diffDays === 0) return 'today';
	if (diffDays ===1) return '1 day ago'
	return `${diffDays} days ago`;
}
