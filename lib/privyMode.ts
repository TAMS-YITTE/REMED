export function isPrivyMock(): boolean {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  return !appId || appId === 'cldummyappid0000000000000' || appId.includes('votre');
}
