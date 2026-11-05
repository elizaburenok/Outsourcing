import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateVat, getVatCalculation } from '../src/data/vat.ts'

test('квартальный пример 22% сходится с суммой трёх платежей', () => {
  const result = getVatCalculation({ category: 'nds', id: 'c2-nds-q3-1', vatRate: 22 })
  assert.ok(result)
  assert.deepEqual(result.sections.map((section) => section.vat), [
    329_393.24, 225_271.99, 225_271.99, 128_557.29,
  ])
  assert.equal(result.exactTax, 200_835.95)
  assert.equal(result.accruedVat, 554_665.23)
  assert.equal(result.deductionsVat, 353_829.28)
  assert.equal(result.tax, 200_835.95)
  assert.deepEqual(result.installments, [66_945.32, 66_945.32, 66_945.31])
  assert.equal(result.contractors.length, 9)
  assert.deepEqual(
    [result.contractors[0].saleSideVat, result.contractors[0].purchaseVat, result.contractors[0].documents.length],
    [241_393.24, 0, 6],
  )
  assert.equal(Math.round(result.contractors.reduce((sum, item) => sum + item.purchaseVat, 0) * 100), 12_855_729)
  const mixed = result.contractors.find((item) => item.name === 'ООО «Оптим»')
  assert.deepEqual([mixed.saleCount, mixed.purchaseCount, mixed.saleSideVat, mixed.purchaseVat], [2, 2, 44_000, 28_161.13])
})

test('аванс при отгрузке не увеличивает налог повторно', () => {
  const documents = [
    { id: 'advance', kind: 'advance', contractor: 'Клиент', title: 'Предоплата', gross: 122_000 },
    { id: 'sale', kind: 'sale', contractor: 'Клиент', title: 'Отгрузка', gross: 122_000 },
    { id: 'offset', kind: 'advanceOffset', contractor: 'Клиент', title: 'Зачёт', gross: 122_000, advanceId: 'advance' },
  ]
  assert.equal(calculateVat(documents, 22).tax, 22_000)
  assert.throws(() => calculateVat([...documents, { ...documents[2], id: 'double' }], 22), /превышает/)
})

test('при 5% покупка не даёт вычет, но собственный аванс зачитывается', () => {
  const documents = [
    { id: 'advance', kind: 'advance', contractor: 'Клиент', title: 'Предоплата', gross: 105_000 },
    { id: 'sale', kind: 'sale', contractor: 'Клиент', title: 'Отгрузка', gross: 105_000 },
    { id: 'offset', kind: 'advanceOffset', contractor: 'Клиент', title: 'Зачёт', gross: 105_000, advanceId: 'advance' },
    { id: 'purchase', kind: 'purchase', contractor: 'Поставщик', title: 'Покупка', gross: 122_000, vat: 22_000 },
  ]
  const result = calculateVat(documents, 5)
  assert.equal(result.sections[3].vat, 0)
  assert.equal(result.tax, 5_000)
})

test('зачёт допускает аванс прошлого квартала', () => {
  const documents = [
    { id: 'sale', kind: 'sale', contractor: 'Клиент', title: 'Отгрузка', gross: 122_000 },
    { id: 'offset', kind: 'advanceOffset', contractor: 'Клиент', title: 'Зачёт', gross: 61_000, advanceId: 'prior' },
  ]
  assert.equal(calculateVat(documents, 22, { prior: 11_000 }).tax, 11_000)
})
