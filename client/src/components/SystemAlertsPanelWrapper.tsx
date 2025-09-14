import { useEffect, useRef } from 'react';

interface SystemAlertsPanelWrapperProps {
  alerts: any[];
  onDismiss: (alertId: string) => void;
  onTakeAction: (alertId: string) => void;
}

export default function SystemAlertsPanelWrapper({
  alerts,
  onDismiss,
  onTakeAction
}: SystemAlertsPanelWrapperProps) {
  const panelRef = useRef<any>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    
    let cancelled = false;
    
    (async () => {
      await customElements.whenDefined('system-alerts-panel');
      if (cancelled) return;
      
      if (typeof (el as any).setAlerts === 'function') {
        (el as any).setAlerts(alerts);
      } else {
        el.setAttribute('alerts', JSON.stringify(alerts));
      }
    })();
    
    return () => { cancelled = true; };
  }, [alerts]);

  useEffect(() => {
    const handleAlertDismiss = (event: any) => {
      onDismiss(event.detail.alertId);
    };

    const handleAlertAction = (event: any) => {
      onTakeAction(event.detail.alertId);
    };

    const element = panelRef.current;
    if (element) {
      element.addEventListener('alert-dismiss', handleAlertDismiss);
      element.addEventListener('alert-action', handleAlertAction);
      
      return () => {
        element.removeEventListener('alert-dismiss', handleAlertDismiss);
        element.removeEventListener('alert-action', handleAlertAction);
      };
    }
  }, [onDismiss, onTakeAction]);

  return (
    <system-alerts-panel ref={panelRef} />
  );
}