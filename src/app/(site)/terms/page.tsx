import {
  LegalList,
  LegalPage,
  LegalSection,
} from "@/components/legal/legal-page";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of CivicPulse, including reporting rules, accounts and content.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="These terms explain the rules for using CivicPulse. By creating an account or reporting an issue, you agree to them."
    >
      <LegalSection id="acceptance" title="1. Accepting these terms">
        <p>
          CivicPulse is a community platform for reporting and tracking local
          public issues. By accessing the site, creating an account or
          submitting a report, you agree to these terms and to our{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="/privacy"
          >
            Privacy Policy
          </a>
          .
        </p>
        <p>
          If you do not agree with these terms, please do not use the platform.
        </p>
      </LegalSection>

      <LegalSection id="platform" title="2. What CivicPulse does">
        <p>
          CivicPulse lets residents share reports about public spaces and lets
          authorised staff review, assign and resolve them. Reports are visible
          to the public and may be shared with the relevant local authority or
          field team.
        </p>
        <p>
          We provide the platform, but we do not guarantee that every report
          will be investigated or resolved, or that a resolution will happen
          within a particular time.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="3. Your account">
        <LegalList
          items={[
            "You must provide accurate information when registering and keep it up to date.",
            "You are responsible for keeping your login details secure and for activity on your account.",
            "You must be old enough to enter into a binding agreement in your jurisdiction to create an account.",
            "Do not share your account or impersonate another person, resident or member of staff.",
          ]}
        />
        <p>
          Tell us immediately if you believe your account has been accessed
          without permission.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="4. Acceptable use">
        <p>When using CivicPulse, you must not:</p>
        <LegalList
          items={[
            "Submit false, misleading, duplicated or malicious reports.",
            "Post content that is unlawful, hateful, harassing, defamatory or invasive of another person's privacy.",
            "Upload photos or information that you do not have the right to share.",
            "Attempt to access another person's account, data or restricted areas of the platform.",
            "Scrape, overload, probe or otherwise interfere with the platform or its security.",
            "Use the platform for advertising, spam or unrelated commercial activity.",
          ]}
        />
      </LegalSection>

      <LegalSection id="content" title="5. Content you share">
        <p>
          You keep ownership of the reports, photos and comments you submit. By
          posting them, you give us a permission to store, display, process and
          share that content as needed to operate the platform, including with
          the local authority responsible for the area.
        </p>
        <p>
          Reports are public by design. Please do not include sensitive personal
          information — such as identity documents, medical details or another
          person's contact information — in a report or photo.
        </p>
        <p>
          We may remove content that breaks these terms, is reported by another
          person, or is otherwise unsuitable for a public civic record.
        </p>
      </LegalSection>

      <LegalSection id="moderation" title="6. Moderation and suspension">
        <p>
          We may review, remove or restrict access to content and accounts that
          breach these terms or put other users at risk. Where appropriate, we
          will explain the reason and give you a chance to respond.
        </p>
        <p>
          You may delete your account at any time, subject to our{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="/privacy"
          >
            Privacy Policy
          </a>
          . Reports already published may remain visible as part of the public
          record, with your personal details removed.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="7. Third-party services and links">
        <p>
          CivicPulse may link to third-party sites or use third-party services
          to operate. We are not responsible for the content, availability or
          practices of those third parties.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="8. Disclaimers">
        <p>
          The platform is provided on an “as is” and “as available” basis. To
          the extent permitted by law, we disclaim warranties of
          merchantability, fitness for a particular purpose and
          non-infringement.
        </p>
        <p>
          Information posted by residents, staff or field teams is provided by
          those users. You should not rely on it as professional, legal or
          safety advice.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="9. Limitation of liability">
        <p>
          To the extent permitted by law, CivicPulse and its operators will not
          be liable for indirect, incidental, special or consequential damages,
          or for loss of data, revenue or goodwill, arising from your use of the
          platform. Nothing in these terms limits liability that cannot lawfully
          be limited.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. Changes to these terms">
        <p>
          We may update these terms as the platform changes. When we do, we will
          update the date at the top of this page. Continuing to use CivicPulse
          after an update means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a
            className="font-semibold text-brand hover:text-brand-dark"
            href="mailto:hello@civicpulse.app"
          >
            hello@civicpulse.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
