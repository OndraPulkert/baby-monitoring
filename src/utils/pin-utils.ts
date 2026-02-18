const PREFIX = 'babymon';

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export function getBabyPeerId(pin: string): string {
  return `${PREFIX}-baby-${pin}`;
}

export function getParentPeerId(pin: string): string {
  return `${PREFIX}-parent-${pin}`;
}
