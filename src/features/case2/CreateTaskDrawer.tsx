import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileArchive, FileImage, FileText, FileSpreadsheet } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { TextField } from '@ds/components/TextField'
import { TextAreaField } from '@ds/components/TextAreaField'
import { FlowResultModal } from '@ds/components/FlowResultModal'
import { ROUTES } from '@/routes'
import './CreateTaskDrawer.css'

export type TaskKind = 'ordinary' | 'reconciliation'
type AttachedFile = { id: string; file: File; status: 'adding' | 'ready' | 'error'; error?: string }
const MAX_FILE_SIZE = 30 * 1024 * 1024
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|csv|txt|rtf|jpg|jpeg|png|gif|webp|heic|zip|rar|7z)$/i

function fileDetails(file: File) {
  const extension = file.name.split('.').pop()?.toUpperCase() ?? 'ФАЙЛ'
  const size = file.size < 1024 * 1024
    ? `${Math.max(1, Math.round(file.size / 1024))} КБ`
    : `${(file.size / (1024 * 1024)).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ`
  return `${extension}, ${size}`
}

function fileIcon(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return <img src="/images/figma/upload/file-pdf.svg" alt="" />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(extension ?? '')) return <FileImage size={24} aria-hidden />
  if (['xls', 'xlsx', 'csv'].includes(extension ?? '')) return <FileSpreadsheet size={24} aria-hidden />
  if (['zip', 'rar', '7z'].includes(extension ?? '')) return <FileArchive size={24} aria-hidden />
  return <FileText size={24} aria-hidden />
}

export default function CreateTaskDrawer({ open, onClose, onCreate, defaultTitle = '' }: {
  open: boolean
  onClose: () => void
  onCreate: (title: string, description: string, attachments: string[], kind: TaskKind, fromDefault: boolean) => void
  defaultTitle?: string
}) {
  const navigate = useNavigate()
  const [kind, setKind] = useState<TaskKind | null>(defaultTitle ? 'ordinary' : null)
  const [useDefaultTitle, setUseDefaultTitle] = useState(true)
  const [title, setTitle] = useState(defaultTitle)
  const [titleError, setTitleError] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const addTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  function clearTimers() {
    for (const timer of addTimers.current.values()) clearTimeout(timer)
    addTimers.current.clear()
  }

  function reset() {
    setKind(defaultTitle ? 'ordinary' : null)
    setUseDefaultTitle(true)
    setTitle(defaultTitle)
    setTitleError('')
    setShowResult(false)
    setDescription('')
    setFiles([])
    setDragging(false)
    setFileError('')
    clearTimers()
    if (fileInput.current) fileInput.current.value = ''
  }

  function close() { reset(); onClose() }

  function createAnother() {
    reset()
    setUseDefaultTitle(false)
    setKind(null)
    setTitle('')
  }

  function finish() {
    close()
    navigate(ROUTES.home)
  }

  function selectKind(next: TaskKind) {
    setKind(next)
    setTitle(next === 'reconciliation' ? 'Обработка документов для сверки' : useDefaultTitle ? defaultTitle : '')
    setTitleError('')
    setDescription('')
    setFiles([])
    setFileError('')
    clearTimers()
  }

  function addFiles(incoming: FileList | File[]) {
    setFileError('')
    const entries = Array.from(incoming).map((file) => {
      const error = file.size > MAX_FILE_SIZE ? 'Файл больше 30 МБ' : !ALLOWED_EXTENSIONS.test(file.name) ? 'Неподдерживаемый формат' : undefined
      return { id: crypto.randomUUID(), file, status: error ? 'error' : 'adding', error } as AttachedFile
    })
    setFiles((current) => {
      const next = [...current]
      for (const entry of entries) {
        if (!next.some((item) => item.file.name === entry.file.name && item.file.size === entry.file.size && item.file.lastModified === entry.file.lastModified)) next.push(entry)
      }
      return next
    })
    for (const entry of entries.filter((item) => item.status === 'adding')) {
      const timer = setTimeout(() => {
        setFiles((current) => current.map((item) => item.id === entry.id ? { ...item, status: 'ready' } : item))
        addTimers.current.delete(entry.id)
      }, 450)
      addTimers.current.set(entry.id, timer)
    }
  }

  function removeFile(id: string) {
    const timer = addTimers.current.get(id)
    if (timer) clearTimeout(timer)
    addTimers.current.delete(id)
    setFiles((current) => current.filter((item) => item.id !== id))
    setFileError('')
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files)
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files)
  }

  function submit() {
    if (!kind) return
    if (!title.trim()) { setTitleError('Укажите название задачи'); return }
    if (files.some((item) => item.status === 'adding')) return
    if (files.some((item) => item.status === 'error')) { setFileError('Удалите файлы с ошибками'); return }
    const readyFiles = files.filter((item) => item.status === 'ready')
    if (kind === 'reconciliation' && readyFiles.length === 0) { setFileError('Добавьте хотя бы один документ для сверки'); return }
    onCreate(title.trim(), description.trim(), readyFiles.map((item) => item.file.name), kind, Boolean(defaultTitle && useDefaultTitle))
    setShowResult(true)
  }

  if (!open) return null

  return <><Drawer open={open} onClose={showResult ? undefined : close} side="right" className="ctd__drawer" aria-label={kind ? 'Создание задачи' : 'Выбор типа задачи'}>
    <DrawerHeader onClose={close} backAction={kind && !useDefaultTitle ? { onClick: () => { setKind(null); setFiles([]); setFileError(''); setTitleError(''); clearTimers() }, icon: <ArrowLeft size={24} aria-hidden />, label: 'Назад к выбору задачи' } : undefined}>
      {kind === 'ordinary' ? 'Задача бухгалтеру' : kind === 'reconciliation' ? 'Обработка документов' : 'Новая задача'}
    </DrawerHeader>

    {kind === null ? <div className="ctd__body ctd__body--choice">
      <div className="ctd__options">
        <button type="button" className="ctd__option" onClick={() => selectKind('ordinary')}>
          <Cell textScale="M" verticalSpacing="none" title="Задача бухгалтеру" description="Задайте вопрос или поручите работу бухгалтеру" />
        </button>
        <button type="button" className="ctd__option" onClick={() => selectKind('reconciliation')}>
          <Cell textScale="M" verticalSpacing="none" title="Обработка документов для сверки" description="Передайте документы, чтобы бухгалтер проверил расчёты" />
        </button>
      </div>
    </div> : <>
      <div className="ctd__body">
        <TextField variant="tui" label="Название" value={title} onChange={(event) => { setTitle(event.target.value); if (titleError) setTitleError('') }} errorMessage={titleError} required placeholder={kind === 'reconciliation' ? 'Какие документы нужно обработать' : 'Что нужно сделать'} />
        <TextAreaField variant="tui" label="Описание" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={kind === 'reconciliation' ? 'Что и за какой период нужно сверить' : 'Детали задачи для бухгалтера'} />
        <div className="ctd__files">
          <input ref={fileInput} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp,.heic,.zip,.rar,.7z" className="ctd__file-input" onChange={onFileChange} aria-label="Выбрать документы" aria-required={kind === 'reconciliation'} />
          <div className={`ctd__file-group${dragging ? ' ctd__file-group--dragging' : ''}${fileError ? ' ctd__file-group--error' : ''}`}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false) }}
            onDrop={onDrop}>
            <button type="button" className="ctd__add-file" onClick={() => fileInput.current?.click()}>
              <span className="ctd__file-icon"><img src="/images/figma/upload/plus.svg" alt="" /></span>
              <span className="ctd__file-copy"><span className="ctd__add-title">Загрузить файлы</span><span className="ctd__file-meta">Изображения, документы или архивы, до 30 МБ</span></span>
            </button>
            {files.length > 0 && <ul className="ctd__file-list">{files.map((entry) => <li key={entry.id} className={entry.status === 'error' ? 'ctd__file-row--error' : ''}>
              <span className="ctd__file-icon">{entry.status === 'adding' ? <img className="ctd__progress" src="/images/figma/upload/progress.svg" alt="" /> : fileIcon(entry.file)}</span>
              <span className="ctd__file-copy"><span className="ctd__file-title" title={entry.file.name}>{entry.file.name}</span><span className="ctd__file-meta">{entry.error ?? (entry.status === 'adding' ? 'Добавляется…' : fileDetails(entry.file))}</span></span>
              <button type="button" className="ctd__remove-file" aria-label={`Удалить файл ${entry.file.name}`} onClick={() => removeFile(entry.id)}><img src="/images/figma/upload/trash.svg" alt="" /></button>
            </li>)}</ul>}
          </div>
          {fileError && <span className="ctd__files-error" role="alert">{fileError}</span>}
        </div>
      </div>
      <DrawerFooter className="ctd__footer" type="1 Button" primaryAction={{ label: 'Создать задачу', onClick: submit, disabled: files.some((item) => item.status === 'adding') }} />
    </>}
  </Drawer>
    {showResult && <FlowResultModal tone="success" icon={<img src="/images/figma/result/success.svg" alt="" />} title="Задача создана" primaryLabel="Готово" onPrimary={finish} secondaryLabel="Создать ещё одну задачу" onSecondary={createAnother}>
      <p>Мы отправили задачу бухгалтеру. Она появится в разделе «Задачи».</p>
    </FlowResultModal>}
  </>
}
