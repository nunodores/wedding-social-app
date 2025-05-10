import { GuestLoginForm } from '@/components/login/guest-login-form';

export default function GuestLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">WeddingSnap</h1>
        <p className="text-muted-foreground">
          Connect with the wedding community
        </p>
      </div>
      
      <GuestLoginForm />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Share your photos and videos with the wedding couple and other guests
      </p>
    </div>
  );
}