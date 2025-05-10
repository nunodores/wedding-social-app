import { EventAccessForm } from '@/components/login/event-access-form';

export default function EventLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">WeddingSnap</h1>
        <p className="text-muted-foreground">
          Share and enjoy moments from the special day
        </p>
      </div>
      
      <EventAccessForm />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        A beautiful way to collect memories from the wedding day
      </p>
    </div>
  );
}