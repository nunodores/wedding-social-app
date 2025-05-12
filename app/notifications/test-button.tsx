'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function TestNotificationButton() {
  const [isSending, setIsSending] = useState(false);

  const handleTestNotification = async () => {
    try {
      setIsSending(true);
      const response = await fetch('/api/notifications/test', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send notification');
      }

      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button 
      onClick={handleTestNotification}
      disabled={isSending}
    >
      {isSending ? 'Sending...' : 'Send Test Notification'}
    </Button>
  );
}