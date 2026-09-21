export function isLocalAccount(account: unknown): account is string {
  return (
    typeof account === 'string' &&
    /^local:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(account)
  );
}

export function accountLabel(account: string | null) {
  if (!account) return '이전 버전 기록';
  return isLocalAccount(account) ? '내 분석 기록' : `@${account}`;
}
