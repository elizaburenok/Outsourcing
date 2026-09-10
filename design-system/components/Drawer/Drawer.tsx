import React, { useEffect, useRef } from 'react';
import './Drawer.css';

export type DrawerSide = 'right' | 'bottom';

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Called on overlay click or Escape */
  onClose?: () => void;
  /** Which edge the sheet is anchored to */
  side?: DrawerSide;
  /** Drawer content — compose DrawerHeader / body / DrawerFooter here */
  children?: React.ReactNode;
  /** Additional CSS class for the panel */
  className?: string;
  /** Accessible label for the dialog */
  'aria-label'?: string;
  /** HTML data attributes */
  'data-testid'?: string;
}

/**
 * Overlay shell for a slide-in sheet. Provides the scrim, panel positioning,
 * slide-in animation, Escape / click-outside close and body scroll lock.
 * Compose DrawerHeader, a scrollable body and DrawerFooter inside it.
 */
export const Drawer: React.FC<DrawerProps> = (props) => {
  const {
    open,
    onClose,
    side = 'right',
    children,
    className,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  } = props;

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={['drawer-overlay', `drawer-overlay--${side}`].join(' ')}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className={['drawer', `drawer--${side}`, className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        data-testid={dataTestId}
      >
        {children}
      </div>
    </div>
  );
};

export default Drawer;
