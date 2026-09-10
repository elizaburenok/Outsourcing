import { useState } from 'react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { TextField } from '@ds/components/TextField'
import { TextAreaField } from '@ds/components/TextAreaField'
import './CreateTaskDrawer.css'

/**
 * Дроппер «Создать задачу» — постановка задачи бухгалтеру с Главной (Кейс 2).
 * Собран на DS `Drawer`/`TextField`/`TextAreaField`. Прототип: сабмит очищает поля и
 * закрывает дровер (реального бэкенда нет).
 */
export default function CreateTaskDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  function reset() {
    setTitle('')
    setDescription('')
  }

  function close() {
    reset()
    onClose()
  }

  function submit() {
    // Прототип: задачу никуда не отправляем — просто закрываем и сбрасываем форму.
    close()
  }

  if (!open) return null

  return (
    <Drawer open={open} onClose={close} side="right" aria-label="Создать задачу">
      <DrawerHeader onClose={close}>Создать задачу</DrawerHeader>

      <div className="ctd__body">
        <TextField
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что нужно сделать"
        />
        <TextAreaField
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Детали задачи для бухгалтера"
        />
      </div>

      <DrawerFooter
        type="1 Button"
        primaryAction={{ label: 'Создать задачу', onClick: submit, disabled: !title.trim() }}
      />
    </Drawer>
  )
}
