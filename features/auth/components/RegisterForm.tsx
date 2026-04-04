import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
} from '@/components/common/ResponsiveDialog';
import { AlertCircle, Mail, Check, X } from 'lucide-react';
import { useLinkAccount, useSignUp } from '../auth.hooks';
import GithubIcon from '@/utils/icons/GithubIcon';
import GoogleIcon from '@/utils/icons/GoogleIcon';
import { APP_NAME } from '@/utils/consts/env';

// Define validation schema
const registerSchemaFields = {
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
};

const registerSchema = z
  .object(registerSchemaFields)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// Password strength rules for inline indicator
const passwordRules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;

  const passed = passwordRules.filter((r) => r.test(value)).length;
  const total = passwordRules.length;
  const percent = (passed / total) * 100;

  return (
    <div className="space-y-2 pt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {passwordRules.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < passed
                ? percent <= 40
                  ? 'bg-red-500'
                  : percent <= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Inline checklist */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
        {passwordRules.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-1 transition-colors duration-200 ${
                ok ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {ok ? (
                <Check className="h-3 w-3 shrink-0" />
              ) : (
                <X className="h-3 w-3 shrink-0" />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RegisterForm() {
  const registerUser = useSignUp();
  const socialSignUp = useLinkAccount();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      termsAccepted: false,
    },
  });

  const passwordValue = form.watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      const fullName = `${data.firstName} ${data.lastName}`;

      await registerUser.mutateAsync({
        email: data.email,
        password: data.password,
        name: fullName,
      });
      navigate('/verification-sent', { replace: true });
    } catch (err: unknown) {
      setError(
        `Registration failed. Please try again.${
          err && typeof err === 'object' && 'message' in err
            ? (err as { message?: string }).message
            : ''
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Create your account
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Join {APP_NAME} to manage your finances with style
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ── Social sign-up FIRST ── */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  await socialSignUp.mutateAsync({ provider: 'google' });
                } catch (err) {
                  console.error('Google login error:', err);
                  setError('Google login failed. Please try again.');
                }
              }}
              className="h-12 rounded-xl border-2 border-border hover:border-primary hover:bg-accent transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2">
                <GoogleIcon />
                <span className="font-medium text-foreground group-hover:text-foreground">
                  Google
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                try {
                  await socialSignUp.mutateAsync({ provider: 'github' });
                } catch (err) {
                  console.error('GitHub login error:', err);
                  setError('GitHub login failed. Please try again.');
                }
              }}
              className="h-12 rounded-xl border-2 border-border hover:border-foreground hover:bg-accent transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2">
                <GithubIcon />
                <span className="font-medium text-foreground group-hover:text-foreground">
                  GitHub
                </span>
              </div>
            </Button>
          </div>

          {/* ── Divider ── */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* ── Manual form ── */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      placeholder="First name"
                      autoComplete="given-name"
                      className="h-12 rounded-xl border-border focus:border-ring focus:ring-ring transition-all duration-200"
                    />
                    {fieldState.invalid && (
                      <FieldError className="pl-3">
                        {fieldState.error?.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      placeholder="Last name"
                      autoComplete="family-name"
                      className="h-12 rounded-xl border-border focus:border-ring focus:ring-ring transition-all duration-200"
                    />
                    {fieldState.invalid && (
                      <FieldError className="pl-3">
                        {fieldState.error?.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <Input
                      {...field}
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                      className="h-12 rounded-xl border-border focus:border-ring focus:ring-ring transition-all duration-200 pl-11"
                    />
                    {fieldState.invalid && (
                      <FieldError className="pl-3">
                        {fieldState.error?.message}
                      </FieldError>
                    )}
                  </div>
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="group">
                  <Input
                    {...field}
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border focus:border-ring focus:ring-ring transition-all duration-200"
                  />
                  <PasswordStrength value={passwordValue} />
                  {fieldState.invalid && (
                    <FieldError className="pl-3">
                      {fieldState.error?.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="group">
                  <Input
                    {...field}
                    placeholder="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border focus:border-ring focus:ring-ring transition-all duration-200"
                  />
                  {fieldState.invalid && (
                    <FieldError className="pl-3">
                      {fieldState.error?.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="termsAccepted"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel
                      htmlFor="terms"
                      className="font-normal cursor-pointer text-foreground"
                    >
                      I agree to the{' '}
                      <ResponsiveDialog>
                        <ResponsiveDialogTrigger asChild>
                          <button
                            type="button"
                            className="underline underline-offset-4 hover:text-primary transition-colors duration-200 cursor-pointer"
                          >
                            terms and conditions
                          </button>
                        </ResponsiveDialogTrigger>
                        <ResponsiveDialogContent className="max-w-2xl">
                          <ResponsiveDialogHeader>
                            <ResponsiveDialogTitle>
                              Terms and Conditions
                            </ResponsiveDialogTitle>
                            <ResponsiveDialogDescription>
                              Last updated: February 2026
                            </ResponsiveDialogDescription>
                          </ResponsiveDialogHeader>

                          <div className="space-y-4 text-sm text-foreground leading-relaxed py-2 overflow-y-auto">
                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                1. Acceptance of Terms
                              </h3>
                              <p className="text-muted-foreground">
                                By creating an account and using {APP_NAME}, you
                                agree to be bound by these Terms and Conditions.
                                If you do not agree, please do not use our
                                service.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                2. Description of Service
                              </h3>
                              <p className="text-muted-foreground">
                                {APP_NAME} is a personal finance management
                                platform that helps you track expenses, manage
                                budgets, set financial goals, and connect bank
                                accounts via third-party integrations. Features
                                may change over time.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                3. Account Responsibilities
                              </h3>
                              <p className="text-muted-foreground">
                                You are responsible for maintaining the
                                confidentiality of your login credentials and
                                for all activity that occurs under your account.
                                Notify us immediately of any unauthorised use.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                4. Privacy &amp; Data
                              </h3>
                              <p className="text-muted-foreground">
                                We collect and process personal and financial
                                data as described in our Privacy Policy. Your
                                data is encrypted at rest and in transit. We do
                                not sell your personal information to third
                                parties.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                5. Third-Party Integrations
                              </h3>
                              <p className="text-muted-foreground">
                                {APP_NAME} may connect to third-party financial
                                services (e.g., Plaid). Use of these
                                integrations is subject to their respective
                                terms. We are not responsible for the
                                availability or accuracy of third-party
                                services.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                6. Prohibited Use
                              </h3>
                              <p className="text-muted-foreground">
                                You may not use {APP_NAME} for any unlawful
                                purpose, to violate any regulations, to
                                distribute malware, or to attempt unauthorised
                                access to our systems.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                7. Disclaimer of Warranties
                              </h3>
                              <p className="text-muted-foreground">
                                {APP_NAME} is provided &ldquo;as is&rdquo;
                                without warranties of any kind. We do not
                                provide financial advice. Always consult a
                                qualified professional for financial decisions.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                8. Limitation of Liability
                              </h3>
                              <p className="text-muted-foreground">
                                To the maximum extent permitted by law,{' '}
                                {APP_NAME} shall not be liable for any indirect,
                                incidental, or consequential damages arising
                                from your use of the service.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                9. Changes to Terms
                              </h3>
                              <p className="text-muted-foreground">
                                We may update these Terms at any time. Continued
                                use of {APP_NAME}
                                after changes constitutes acceptance of the
                                updated Terms.
                              </p>
                            </section>

                            <section className="space-y-1.5">
                              <h3 className="font-semibold text-base">
                                10. Contact
                              </h3>
                              <p className="text-muted-foreground">
                                For questions about these Terms, please contact
                                us through the support section in the app.
                              </p>
                            </section>
                          </div>

                          <ResponsiveDialogFooter>
                            <ResponsiveDialogClose asChild>
                              <Button type="button">Close</Button>
                            </ResponsiveDialogClose>
                          </ResponsiveDialogFooter>
                        </ResponsiveDialogContent>
                      </ResponsiveDialog>
                    </FieldLabel>
                  </Field>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span>Create account</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
