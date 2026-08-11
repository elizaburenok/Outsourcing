/** Русское склонение «операция/операции/операций». */
export function pluralOps(n: number): string {
  const mod100 = n % 100
  const mod10 = n % 10
  let word = 'операций'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'операция'
    else if (mod10 >= 2 && mod10 <= 4) word = 'операции'
  }
  return `${n} ${word}`
}
