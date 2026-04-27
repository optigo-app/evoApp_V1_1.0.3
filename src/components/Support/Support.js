import { Button } from "@mui/material";
import { House } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import './Support.scss'

const SupporthTML = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Support | Evoapp</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
</head>

<body class="bg-white">

    <div class="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-16">
        <div class="max-w-3xl mx-auto space-y-10">

            <!-- Header -->
            <header class="text-center">
                <p class="mt-2 text-lg sm:text-2xl text-gray-600">
                    We're committed to providing excellent support to all Evo App users.
                </p>
            </header>

            <!-- Section: How to Get Help -->
            <section class="space-y-6">
                <h2 class="text-xl font-semibold text-gray-800">How to Get Help</h2>
                <p class="text-gray-700">
                    If you need assistance, reach out to our support team through the following channels:
                </p>
                <ul class="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                        <strong>Email Support:</strong>
                        <a href="mailto:support@orail.in" class="hover:underline"
                            style="color: #B937A7;">support@orail.in</a>
                    </li>
                    <li>
                        <strong>Phone Support:</strong>
                        <a href="tel:02613603500" class="hover:underline" style="color: #B937A7;">0261-3603500</a>
                    </li>
                </ul>
            </section>

            <!-- Section: User Guides -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">User Guides and Tutorials</h2>
                <p class="text-gray-700">
                    Explore step-by-step guides for using the Evo App—from managing customer data and scanning products
                    to generating prints, sales orders, and managing stock and designs.
                </p>
            </section>

            <!-- Section: System Status -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">System Status and Updates</h2>
                <p class="text-gray-700">
                    Stay informed about ongoing issues, scheduled maintenance, and system updates that may impact app
                    performance.
                </p>
            </section>

            <!-- Section: Support Hours -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">Support Hours</h2>
                <p class="text-gray-700">
                    Our support team is available:
                </p>
                <ul class="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Monday to Saturday:</strong> 9:30 AM – 6:30 PM (EST)</li>
                    <li><strong>Sunday:</strong> Closed</li>
                </ul>
                <p class="text-gray-600">
                    For inquiries outside these hours, email us and we’ll get back to you as soon as possible.
                </p>
            </section>

            <!-- Section: Feedback -->
            <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-800">Feedback and Suggestions</h2>
                <p class="text-gray-700">
                    We value your input! Share your feedback and ideas for improving Evo App by emailing us at
                    <a href="mailto:support@orail.in" class="hover:underline"
                        style="color: #B937A7;">support@orail.in</a>.
                </p>
            </section>

        </div>
    </div>

</body>

</html>
`;

const Support = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Support for Evo App</p>
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

export default Support;
