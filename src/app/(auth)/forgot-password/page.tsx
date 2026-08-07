import { Button } from '../../../components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Forgot Password Form */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg">
          Send reset link
        </Button>

        <Button variant="ghost" size="lg" className="w-full">
          <ArrowLeft className="mr-2 size-4" />
          Back to login
        </Button>
      </div>
    </div>
  );
}
