'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const eventAccessSchema = z.object({
  slug: z.string().min(1, 'Event code is required'),
  password: z.string().min(1, 'Password is required'),
});

type EventAccessFormValues = z.infer<typeof eventAccessSchema>;

export function EventAccessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<EventAccessFormValues>({
    resolver: zodResolver(eventAccessSchema),
    defaultValues: {
      slug: '',
      password: '',
    },
  });

  async function onSubmit(values: EventAccessFormValues) {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/event-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to access event');
      }
      
      const data = await response.json();
      
      // Store wedding event ID in session storage for the next step
      sessionStorage.setItem('weddingEventId', data.weddingEventId);
      sessionStorage.setItem('weddingEventSlug', values.slug);
      
      toast.success('Event access granted!');
      router.push('/login/guest');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to access event');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Wedding Access</CardTitle>
        <CardDescription className="text-center">
          Enter the event details provided by the couple
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., sarah-john" 
                      {...field} 
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Event password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Continue to Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Contact the couple if you don&apos;t have these details
      </CardFooter>
    </Card>
  );
}