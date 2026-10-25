import {
  LegalList,
  LegalPage,
  LegalSection,
} from "@/components/legal/legal-page";

export const metadata = {
  title: "Security",
  description:
    "How CivicPulse protects accounts and reports, and how to report a security concern.",
};

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      description="CivicPulse handles community reports and account data. This page explains the safeguards we use and how to report a concern."
    >
      <LegalSection id="approach" title="1. Our approach">
        <p>
          Security is built into how the platform is designed and operated. We
          aim to protect the confidentiality, integrity and availability of
          accounts, reports and supporting infrastructure.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="2. Account protection">
        <LegalList
          items={[
            "Passwords are stored using one-way hashing, never in plain text.",
            "New accounts are verified by email before they can sign in.",
            "Sessions are protected and expire, and you can sign out at any time.",
            "Access to staff and administrative tools is limited by role.",
          ]}
        />
        <p>
          Use a unique password, keep your email account secure, and never share
          your login details. If you suspect unauthorised access, change your
          password and contact us immediately.
        </p>
      </LegalSection>

      <LegalSection id="data" title="3. Protecting data">
        <LegalList
          items={[
            "Traffic between your browser and CivicPulse is encrypted with HTTPS in production.",
            "Access to production systems is restricted to authorised personnel.",
            "Reports are handled through role-based workflows, so only the right teams can update them.",
            "We keep dependencies and platform components up to date and monitor for known vulnerabilities.",
          ]}
        />
        <p>
          No service can promise perfect security. We work to reduce risk,
          detect problems quickly and respond when issues are reported.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="4. Public information and privacy">
        <p>
          Reports are public by design. Please avoid uploading identity
          documents, personal contact details, medical information or images of
          people who have not consented. If a report or photo exposes personal
          information, contact us and we will review it.
        </p>
      </LegalSection>

      <LegalSection id="report" title="5. Reporting a vulnerability">
        <p>
          If you believe you have found a security vulnerability, please email{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="mailto:security@civicpulse.app"
          >
            security@civicpulse.app
          </a>{" "}
          with enough detail for us to reproduce the issue.
        </p>
        <p>When researching, please:</p>
        <LegalList
          items={[
            "Act in good faith and avoid accessing, changing or deleting other people's data.",
            "Do not run automated scans that could disrupt the service.",
            "Give us a reasonable opportunity to investigate and fix the issue before public disclosure.",
            "Keep the details confidential until we have resolved the issue.",
          ]}
        />
        <p>
          We will acknowledge your report, keep you updated and credit you if
          you would like. We will not pursue legal action against researchers
          who follow these guidelines.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="6. Contact">
        <p>
          For any other security question, email{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="mailto:security@civicpulse.app"
          >
            security@civicpulse.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
