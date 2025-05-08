import React from 'react';
import '../styles/components/other/privacypolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="container">
      <div className="privacy-policy">
        <h1>Data Usage and Privacy Policy</h1>
        <p>
          At <strong>CrumbCompass</strong>, we are committed to protecting your personal data and ensuring your privacy.
          We strictly adhere to the guidelines set forth by the General Data Protection Regulation (GDPR) to safeguard your information and respect your rights.
        </p>

        {/* New Institutional Information */}
        <h2>Project Affiliation and Hosting</h2>
        <p>
          This project is conducted as a student initiative at Danmarks Tekniske Universitet (DTU) and is hosted on DTU's secure servers.
          All activities are performed in accordance with DTU's policies and guidelines.
        </p>

        {/* Backup and Security */}
        <h2>Data Backups and Security Measures</h2>
        <p>
          Regular backups of project data are performed to ensure data integrity and availability.
          For security purposes, we may log and access IP addresses to detect, prevent, and mitigate potential threats.
        </p>

        {/* Entity and Data Responsibility */}
        <h2>Data Controller</h2>
        <p>
          <strong>CrumbCompass</strong> is not a juridical entity.
          Our designated data responsible person is <strong>Rachid Moutiq</strong>, who can be contacted regarding data matters at <a href="s235437@student.dtu.dk">rachid.moutiq@dtu.dk</a>.
        </p>

        {/* Breach Notification */}
        <h2>Data Breach Notification</h2>
        <p>
          In the event of any personal data breach, we will investigate, address the issue promptly, and notify affected users within 72 hours.
          Users are responsible for keeping their email addresses up to date to receive such notifications.
        </p>

        {/* Third-Party Data Sharing */}
        <h2>Third-Party Data Sharing</h2>
        <p>
          We will not share your personal data with third parties without your explicit consent, except where required by law.
          We adhere to the guidelines and recommendations of the Danish Data Protection Agency (Datatilsynet).
        </p>

        <h2>Why We Collect Your Data</h2>
        <p>
          We collect and store certain personal data for security and operational purposes. This includes:
        </p>
        <ul>
          <li>
            <strong>IP Addresses:</strong> To prevent and mitigate potential Denial of Service (DoS) attacks and ensure the security of our platform.
          </li>
          <li>
            <strong>Email Addresses, Usernames, and Passwords:</strong> To manage user accounts, authenticate users, and provide a secure experience.
          </li>
        </ul>
        <p>
          This information is essential for maintaining the integrity and security of our services, preventing unauthorized access, and ensuring a safe user experience.
        </p>

        <h2>Our Commitment to GDPR</h2>
        <p>
          We adhere to the principles of GDPR, which include:
        </p>
        <ul>
          <li>
            <strong>Lawfulness, Fairness, and Transparency:</strong> We process your data lawfully and transparently, ensuring you are informed about how your data is used.
          </li>
          <li>
            <strong>Purpose Limitation:</strong> Your data is collected and used only for the specific purposes mentioned above.
          </li>
          <li>
            <strong>Data Minimization:</strong> We only collect the data that is necessary for the intended purposes.
          </li>
          <li>
            <strong>Accuracy:</strong> We ensure that your data is accurate and up-to-date.
          </li>
          <li>
            <strong>Storage Limitation:</strong> Your data is stored only for as long as necessary to fulfill the purposes for which it was collected.
          </li>
          <li>
            <strong>Integrity and Confidentiality:</strong> We implement robust security measures to protect your data from unauthorized access, breaches, and leaks.
          </li>
          <li>
            <strong>Accountability:</strong> We are accountable for ensuring that your data is processed in compliance with GDPR requirements.
          </li>
        </ul>

        <h2>Your Rights Under GDPR</h2>
        <p>
          As a data subject, you have the following rights:
        </p>
        <ul>
          <li>
            <strong>Access:</strong> You can request access to the personal data we hold about you.
          </li>
          <li>
            <strong>Rectification:</strong> You can request that we correct any inaccurate personal data.
          </li>
          <li>
            <strong>Erasure:</strong> You can request that we delete your personal data under certain conditions.
          </li>
          <li>
            <strong>Restriction:</strong> You can request that we restrict the processing of your personal data.
          </li>
          <li>
            <strong>Portability:</strong> You can request a copy of your personal data in a format that allows you to transfer it to another service.
          </li>
          <li>
            <strong>Objection:</strong> You can object to the processing of your personal data under certain conditions.
          </li>
          <li>
            <strong>Withdrawal of Consent:</strong> You can withdraw your consent to the processing of your personal data at any time.
          </li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions or concerns about our data usage policies or wish to exercise your rights under GDPR, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> <a href="crumbcompass@gmail.com">support@crumbcompass.com</a>
        </p>
        <p>
          We are committed to addressing your concerns promptly and ensuring your data is handled responsibly.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
