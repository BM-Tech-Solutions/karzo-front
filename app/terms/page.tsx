import { Header } from "@/components/header"
import { AuthProvider } from "@/lib/auth-context"

export default function TermsPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Terms of Service</h1>

            <div className="prose dark:prose-invert max-w-none">
              <p>Last Updated: May 15, 2023</p>

              <h2>1. Introduction</h2>
              <p>
                Welcome to Karzo Agent ("we," "our," or "us"). By accessing or using our platform, you agree to be bound
                by these Terms of Service ("Terms"). Please read these Terms carefully.
              </p>

              <h2>2. Definitions</h2>
              <p>
                "Platform" refers to the Karzo Agent website, applications, and services. "User," "you," and "your"
                refer to individuals who access or use the Platform. "Content" includes text, images, audio, video, and
                other materials.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To access certain features of the Platform, you must register for an account. You agree to provide
                accurate information and to keep your account credentials secure. You are responsible for all activities
                that occur under your account.
              </p>

              <h2>4. Platform Usage</h2>
              <p>
                You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not
                to:
              </p>
              <ul>
                <li>Use the Platform in any way that violates applicable laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in any activity that interferes with or disrupts the Platform</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Use the Platform to transmit any malware or other harmful code</li>
              </ul>

              <h2>5. Intellectual Property</h2>
              <p>
                The Platform and its original content, features, and functionality are owned by Karzo Agent and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property
                laws.
              </p>

              <h2>6. User Content</h2>
              <p>
                You retain ownership of any content you submit to the Platform. By submitting content, you grant us a
                worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and
                distribute your content in any existing or future media.
              </p>

              <h2>7. Privacy</h2>
              <p>
                Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms
                by reference.
              </p>

              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Platform immediately, without prior notice or
                liability, for any reason, including if you breach these Terms.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                In no event shall Karzo Agent be liable for any indirect, incidental, special, consequential, or
                punitive damages, including loss of profits, data, or other intangible losses, resulting from your
                access to or use of or inability to access or use the Platform.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                provide at least 30 days' notice prior to any new terms taking effect.
              </p>

              <h2>11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without
                regard to its conflict of law provisions.
              </p>

              <h2>12. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at support@karzoagent.com.</p>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
