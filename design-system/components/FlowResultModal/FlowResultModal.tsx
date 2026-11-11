import { useEffect, type ReactNode } from 'react';
import { Button } from '../Button';
import './FlowResultModal.css';

/** Avatar tone: brand (in progress) or success (done). */
export type FlowResultTone = 'brand' | 'success';

export interface FlowResultModalProps {
  /** Avatar tone */
  tone: FlowResultTone;
  /** Icon rendered inside the avatar */
  icon: ReactNode;
  /** Modal title */
  title: string;
  /** Body content — supporting text below the title */
  children: ReactNode;
  /** Label for the single footer action */
  primaryLabel: string;
  /** Called on primary button click, overlay Escape, or close */
  onPrimary: () => void;
  /** Optional second action below the result text. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * "Flow Result" pattern — a modal that reports the outcome of a flow
 * (in progress / success): status avatar, title, supporting text and a
 * single full-width action in the footer.
 */
export const FlowResultModal: React.FC<FlowResultModalProps> = ({
  tone,
  icon,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onPrimary();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onPrimary]);

  return (
    <div className="frm-overlay">
      <div className="frm" role="dialog" aria-modal="true" aria-label={title}>
        <div className="frm__header" aria-hidden />
        <div className="frm__body">
          <span className={`frm__avatar frm__avatar--${tone}`} aria-hidden>
            {icon}
          </span>
          <div className="frm__content">
            <h2 className="frm__title">{title}</h2>
            <div className="frm__text">{children}</div>
          </div>
        </div>
        <div className="frm__footer">
          {secondaryLabel && onSecondary && <Button className="frm__btn" visualVariant="Secondary" onClick={onSecondary}>
            {secondaryLabel}
          </Button>}
          <Button className="frm__btn" visualVariant="Primary" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlowResultModal;
