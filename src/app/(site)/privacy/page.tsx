import {
  LegalList,
  LegalPage,
  LegalSection,
} from "@/components/legal/legal-page";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What information CivicPulse collects, how it is used, and the choices you have over your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what information CivicPulse collects, why we collect it, and the choices you have. It applies to residents, staff and visitors."
    >
      <LegalSection id="collect" title="1. Information we collect">
        <p>We collect information in three main ways:</p>
        <LegalList
          items={[
            "Account details: your name, email address, password (stored hashed), role and verification status.",
            "Reports and activity: the text, photos, categories, locations, comments and status updates you submit.",
            "Technical data: basic device, browser and usage information needed to keep the service secure and working.",
          ]}
        />
        <p>
          We do not ask for identity documents, payment details or other
          sensitive information. Please do not include such details in a report.
        </p>
      </LegalSection>

      <LegalSection id="use" title="2. How we use your information">
        <LegalList
          items={[
            "To create and secure your account and verify your email address.",
            "To publish, route and track reports, and to notify you about updates.",
            "To let authorised staff and field teams manage and resolve issues.",
            "To keep the platform safe, prevent abuse and troubleshoot problems.",
            "To understand how the service is used so we can improve it.",
          ]}
        />
        <p>
          We do not sell your personal information, and we do not use your
          reports for advertising.
        </p>
      </LegalSection>

      <LegalSection id="public" title="3. Reports are public">
        <p>
          CivicPulse is built around a shared public record. Your report title,
          description, photos, category, general location, status and public
          comments are visible to anyone using the site.
        </p>
        <p>
          Your email address is not shown publicly. Your display name may appear
          next to reports and comments you post. Consider this before sharing
          personal details in a report or photo.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="4. When we share information">
        <p>We share information only where it is needed:</p>
        <LegalList
          items={[
            "With the relevant local authority or field team so they can act on a report.",
            "With service providers who host, secure or support the platform, under appropriate confidentiality obligations.",
            "When required by law, to respond to valid legal requests, or to protect the safety of users and the public.",
            "As part of a reorganisation, merger or transfer of the service, subject to this policy.",
          ]}
        />
      </LegalSection>

      <LegalSection id="cookies" title="5. Cookies and local storage">
        <p>
          We use cookies and browser storage to keep you signed in, remember
          preferences such as your chosen theme, and protect the service against
          abuse. These are essential to how the platform works.
        </p>
        <p>
          You can clear or block cookies in your browser settings. Blocking
          essential cookies may prevent you from signing in or using parts of
          CivicPulse.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="6. How long we keep information">
        <p>
          We keep account and report information for as long as needed to
          operate the service and maintain the public record. When you delete
          your account, we remove or anonymise your personal details, but
          reports that form part of the public record may remain visible without
          them.
        </p>
        <p>
          We may retain limited technical logs for security and legal purposes
          for a shorter period.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="7. Your rights">
        <p>
          Depending on where you live, you may have the right to access,
          correct, delete or restrict the use of your personal information, or
          to object to certain processing.
        </p>
        <p>
          You can update your profile from your account settings. For other
          requests, email{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="mailto:privacy@civicpulse.app"
          >
            privacy@civicpulse.app
          </a>
          . We may need to verify your identity before responding.
        </p>
      </LegalSection>

      <LegalSection id="children" title="8. Children's privacy">
        <p>
          CivicPulse is not directed at children, and we do not knowingly
          collect personal information from children below the age required to
          consent to online services in their jurisdiction. If you believe a
          child has provided us with personal information, please contact us so
          we can remove it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="9. Changes to this policy">
        <p>
          We may update this policy as the service or the law changes. We will
          update the date at the top of this page and, where changes are
          significant, provide a clearer notice.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="10. Contact">
        <p>
          Privacy questions can be sent to{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="mailto:privacy@civicpulse.app"
          >
            privacy@civicpulse.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
