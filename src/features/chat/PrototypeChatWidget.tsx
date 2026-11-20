import { useEffect, useRef } from 'react'
import './PrototypeChatWidget.css'

/** Keep the donor's renderer and conversation state in a dedicated document.
 * Only the actual panel and button receive pointer events over the app.
 */
export default function PrototypeChatWidget() {
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    let disconnect = () => {}

    function connect() {
      disconnect()
      const doc = frame?.contentDocument
      if (!frame || !doc?.body) return
      const surface = frame
      const resize = new ResizeObserver(update)
      let panel: Element | null = null
      function update() {
        if (!doc) return
        const current = doc.querySelector('.pr > .panel')
        if (current !== panel) {
          if (panel) resize.unobserve(panel)
          if (current) resize.observe(current)
          panel = current
        }
        // Separate closed paths leave the bank page clickable between the two controls.
        const paths = Array.from(doc.querySelectorAll('.pr > .fab, .pr > .panel'), el => {
          const box = el.getBoundingClientRect()
          const pad = el.classList.contains('fab') ? 4 : 0
          return 'M ' + (box.left - pad) + ' ' + (box.top - pad) +
            ' H ' + (box.right + pad) + ' V ' + (box.bottom + pad) + ' H ' + (box.left - pad) + ' Z'
        })
        surface.style.clipPath = paths.length ? 'path("' + paths.join(' ') + '")' : 'inset(100%)'
      }
      const observer = new MutationObserver(update)
      observer.observe(doc.body, { childList: true, subtree: true })
      resize.observe(doc.documentElement)
      update()
      disconnect = () => { observer.disconnect(); resize.disconnect() }
    }

    frame.addEventListener('load', connect)
    connect()
    return () => { disconnect(); frame.removeEventListener('load', connect) }
  }, [])

  return <div className="support-chat-layer">
    <iframe ref={frameRef} className="support-chat-frame" title="Чат поддержки"
      src={import.meta.env.BASE_URL + 'support-chat/index.html'} />
  </div>
}
