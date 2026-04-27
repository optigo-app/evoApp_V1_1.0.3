import { Button } from "@mui/material";
import { House } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const SupporthTML = `
   <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy | Evoapp </title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
</head>

<body class="bg-white">

    <div class="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-3xl mx-auto space-y-10">

            <!-- Header -->
            <header class="text-center">
                <h1 class="text-4xl font-bold" style="color: #4B63BF;">Privacy Policy</h1>
                <p class="text-sm text-gray-500 mt-3">Effective Date:19 Aug 2025</p>
            </header>

            <!-- Section 1 -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">1. Introduction</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    Welcome to <strong>Evo App</strong> ("we," "our," or "us"). We respect your privacy and are
                    committed to protecting
                    your personal information. This Privacy Policy explains:
                    <li class="ml-5">What data we collect</li>
                    <li class="ml-5">Why we collect it</li>
                    <li class="ml-5">How we use it</li>
                    <li class="ml-5">How we protect it</li>
                    <li class="ml-5">Your rights regarding your data</li>
                </ul>
                <p>By using our App, you agree to the collection and use of your data as described in this Privacy
                    Policy.</p>
            </section>

            <!-- Section 2 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">2. Information We Collect</h2>
                <p>
                    We collect the following data:
                </p>

                <h4 class="text-xl font-semibold" style="color: #4B63BF;">A. Personal Information (Provided by
                    Users)</h4>
                <ul class="list-disc list-inside text-gray-700 text-justify">
                    When you register or log in, we collect:
                    <li class="ml-5 mt-2"><strong>First Name</strong></li>
                    <li class="ml-5"><strong>Last Name</strong></li>
                    <li class="ml-5"><strong>Email Address</strong></li>
                    <li class="ml-5"><strong>Mobile Number</strong></li>
                    <li class="ml-5"><strong>Password</strong> (encrypted and stored securely)</li>
                    <li class="ml-5"><strong>Address</strong></li>
                    <li class="ml-5"><strong>Country</strong></li>
                    <li class="ml-5"><strong>State</strong></li>
                    <li class="ml-5"><strong>City</strong></li>
                    <li class="ml-5"><strong>Zip Code</strong></li>
                </ul>

                <h4 class="text-xl font-semibold mt-2" style="color: #4B63BF;">B. Device Information (Collected
                    Automatically)</h4>
                <ul class="list-disc list-inside text-gray-700 text-justify">
                    To ensure app compatibility and security, we collect:
                    <li class="ml-5 mt-2"><strong>Brand:</strong> (e.g., Samsung, Apple)</li>
                    <li class="ml-5 mt-2"><strong>Model:</strong> (e.g., Galaxy S23, iPhone 14)</li>
                    <li class="ml-5 mt-2"><strong>Manufacturer:</strong> (e.g., Samsung Electronics, Apple Inc.)</li>
                    <li class="ml-5 mt-2"><strong>OS Version:</strong> (e.g., Android 13, iOS 17)</li>
                    <li class="ml-5 mt-2"><strong>OS Version Code:</strong> (e.g., SDK 34 for Android)</li>
                    <li class="ml-5 mt-2"><strong>Device Type:</strong> (e.g., "android" or "iOS")</li>
                </ul>

                <h4 class="text-xl font-semibold mt-2" style="color: #4B63BF;">C. User Identifiers</h4>
                <ul class="list-disc list-inside text-gray-700 text-justify">
                    To provide a personalized experience, we collect:
                    <li class="ml-5 mt-2"><strong>OneSignal UID:</strong> A unique identifier for push notifications.
                    </li>
                    <li class="ml-5 mt-2"><strong>Device ID:</strong> A unique identifier for managing user sessions.
                    </li>
                </ul>

                <h4 class="text-xl font-semibold mt-2" style="color: #4B63BF;">D. Usage Data & Crash Reports</h4>
                <ul class="list-disc list-inside text-gray-700 text-justify">
                    We use <strong>Firebase</strong> for performance monitoring and error tracking. This may include:
                    <li class="ml-5 mt-2"><strong>Error logs</strong></li>
                    <li class="ml-5 mt-2"><strong>Crash reports</strong></li>
                    <li class="ml-5 mt-2"><strong>App performance data</strong></li>
                </ul>
                <p>Even if Firebase Crashlytics is not explicitly configured, Firebase may still collect diagnostic
                    information for troubleshooting purposes.</p>
                <p>This data is <strong>only used for app improvements</strong> and is <strong>not shared for
                        advertising
                        purposes.</strong></p>
            </section>

            <!-- Section 3 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">3. How We Use Your Information</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    We use collected data for:
                    <li class="ml-5 mt-2"><strong>Authentication & Security:</strong> Verify accounts and prevent fraud.
                    </li>
                    <li class="ml-5 mt-2"><strong>App Performance:</strong> Improve user experience based on device
                        compatibility.</li>
                    <li class="ml-5 mt-2"><strong>Push Notifications:</strong> Send updates and promotional alerts via
                        OneSignal.</li>
                    <li class="ml-5 mt-2"><strong>Bug Fixing & Crash Reports:</strong> Identify and resolve technical
                        issues.</li>
                    <li class="ml-5 mt-2"><strong>Order Management:</strong> Process orders and transactions.</li>
                    <li class="ml-5 mt-2"><strong>Compliance:</strong> Ensure legal and regulatory compliance.</li>
                </ul>
                <p>We <strong>do not sell or share your personal data with advertisers.</strong></p>
            </section>

            <!-- Section 4 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">4. How We Share Your Information</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    We <strong>do not sell</strong> your personal data. However, we may share data in the following
                    cases:
                    <li class="ml-5 mt-2"><strong>With Service Providers:</strong> We use third-party services (e.g.,
                        Firebase, OneSignal) to improve our App.
                    </li>
                    <li class="ml-5 mt-2"><strong>With Legal Authorities:</strong> If required by law, we may disclose
                        your information.</li>
                </ul>
            </section>

            <!-- Section 5 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">5. Data Security</h2>
                <ul class="text-gray-700 space-y-2 text-justify">
                    We implement security measures to protect your data:
                    <li class="ml-5 mt-2"><strong>✅ Encryption:</strong> Passwords are encrypted before storage.
                    </li>
                    <li class="ml-5 mt-2"><strong>✅ Secure Storage:</strong> Sensitive data is stored securely.</li>
                    <li class="ml-5 mt-2"><strong>✅ Restricted Access:</strong> Only authorized personnel can access
                        user data.</li>
                </ul>
                <p>We take appropriate security measures to protect your data. However, <strong>no method of
                        transmission over
                        the internet or electronic storage is 100% secure.</strong> We encourage you to keep your login
                    credentials
                    confidential and take steps to protect your account from unauthorized access.</p>
            </section>

            <!-- Section 6 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">6. Your Rights & Choices</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    You have the following rights:
                    <li class="ml-5 mt-2"><strong>Correction:</strong> Request corrections to inaccurate data.
                    </li>
                    <li class="ml-5 mt-2"><strong>Deletion:</strong> Request data deletion (subject to legal
                        obligations).</li>
                    <li class="ml-5 mt-2"><strong>Notification Preferences:</strong> You cannot opt out of receiving
                        push notifications within the app. However, you can manage notification preferences through your
                        device settings.</li>
                </ul>
                <p>To exercise these rights, contact us at <strong>support@orail.in.</strong></p>
            </section>

            <!-- Section 7 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">7. Data Retention Policy</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    We retain all collected data <strong>until the user deletes their account.</strong> This includes,
                    but is not limited
                    to:
                    <li class="ml-5 mt-2"><strong>Personal Information:</strong> First name, last name, email, address,
                        city, country, state, zip code, mobile number, encrypted password.
                    </li>
                    <li class="ml-5 mt-2"><strong>Device Information:</strong> Brand, model, manufacturer, OS version,
                        OS version code, device type.</li>
                    <li class="ml-5 mt-2"><strong>User Identifiers:</strong> OneSignal UID (for push notifications),
                        Device ID.</li>
                    <li class="ml-5 mt-2"><strong>Usage Data:</strong> App activity logs, error logs, and crash reports
                        (collected via Firebase).</li>
                    <li class="ml-5 mt-2"><strong>Order & Transaction Data:</strong> if applicable, any order history or
                        transaction details linked to the user.</li>
                </ul>
                <p>Once a user requests account deletion, all associated data is <strong>permanently erased</strong>,
                    except where retention is required by law or for fraud prevention.</p>
                <p>Users can request account and data deletion by contacting <strong>support@orail.in.</strong></p>
            </section>

            <!-- Section 8 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">8. Third-Party Services</h2>
                <p>Our App uses third-party services to improve functionality, performance, and user experience. These
                    services may collect and process data per their own privacy policies.</p>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    The third-party services we use include:
                    <li class="ml-5 mt-2"><strong>OneSignal</strong> (for push notifications) – Privacy Policy
                    </li>
                    <li class="ml-5 mt-2"><strong>Firebase</strong> (for analytics and crash reporting) – Privacy Policy
                    </li>
                </ul>
                <p>These services may collect device and usage data to enhance performance and stability. We <strong>do
                        not</strong> share personal information with these services for advertising purposes.</p>
                <p>For more details, please refer to their respective privacy policies.</p>
            </section>

            <!-- Section 9 -->
            <section class="space-y-3">
                <h2 class="text-xl font-semibold text-gray-800">9. Changes to This Privacy Policy</h2>
                <ul class="list-disc list-inside text-gray-700 space-y-2 text-justify">
                    We may update this Privacy Policy. Users will be notified of changes via:
                    <li class="ml-5 mt-2"><strong>In-app notifications</strong></li>
                    <li class="ml-5 mt-2"><strong>Emails (if applicable)</strong></li>
                </ul>
                <p>We encourage users to review the Privacy Policy regularly.</p>
            </section>

            <!-- Section 10 -->
            <section class="space-y-3">
                <p>Evo App</p>
                <p>Address: ITC D-Block, G 19-22A, International Trade Center, Majura Gate, Ring Road, Surat – 395002.
                    Gujarat (INDIA).</p>
                <p>Email: <strong>support@orail.in</strong> </p>
            </section>

        </div>
    </div>

</body>

</html>
    `;
  return (
    <>
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Evo App Privacy Policy</p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/")}
              variant="contained"
            >
              <House />
            </Button>
          </div>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: SupporthTML }}></div>
    </>
  );
};

export default PrivacyPolicy;
