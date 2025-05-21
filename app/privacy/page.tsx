import { Header } from "@/components/header"
import { AuthProvider } from "@/lib/auth-context"

export default function PrivacyPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>

            <div className="prose dark:prose-invert max-w-none">
              <p>Last Updated: May 15, 2023</p>

              <h2>1. Introduction</h2>
              <p>
                At Karzo Agent, we respect your privacy and are committed to protecting your personal data. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>

              <h2>2. Information We Collect</h2>
              <p>We collect several types of information from and about users of our Platform, including:</p>
              <ul>
                <li>
                  <strong>Personal Data:</strong> Name, email address, phone number, and professional information.
                </li>
                <li>
                  <strong>Profile Data:</strong> Your username, password, and profile picture.
                </li>
                <li>
                  <strong>Interview Data:</strong> Video recordings, transcripts, and assessments from interviews
                  conducted on our platform.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you access and use our Platform.
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type, device information, and cookies.
                </li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including:</p>
              <ul>
                <li>Providing and maintaining our Platform</li>
                <li>Processing and facilitating interview sessions</li>
                <li>Analyzing interview performance and generating assessments</li>
                <li>Improving our Platform and user experience</li>
                <li>Communicating with you about your account or our services</li>
                <li>Ensuring the security of our Platform</li>
              </ul>

              <h2>4. Data Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>
                  <strong>Employers:</strong> If you are a candidate, your interview data may be shared with potential
                  employers who have invited you to interview.
                </li>
                <li>
                  <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights.
                </li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against
                unauthorized or unlawful processing, accidental loss, destruction, or damage.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We will retain your personal data only for as long as necessary to fulfill the purposes for which it was
                collected, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting
                requirements.
              </p>

              <h2>7. Your Data Protection Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li>The right to access your personal data</li>
                <li>The right to rectification of your personal data</li>
                <li>The right to erasure of your personal data</li>
                <li>The right to restrict processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to object to processing of your personal data</li>
              </ul>

              <h2>8. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our Platform and to hold certain
                information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
                sent.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our Platform is not intended for children under the age of 16, and we do not knowingly collect personal
                data from children under 16.
              </p>

              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last Updated" date.
              </p>

              <h2>11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@karzoagent.com.</p>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
