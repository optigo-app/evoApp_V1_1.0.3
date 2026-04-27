import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Assuming you already have Lucide installed, if not, you can add it via npm or use a CDN
// Example: npm install lucide-react
import {
  CheckCircle,
  ClipboardList,
  Lock,
  QrCode,
  ServerOff,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

const Register = () => {
  const steps = [
    {
      title: "Welcome to Evoapp!",
      subtitle: "Your ultimate jewelry business solution",
    },
    {
      title: "Key Features",
      subtitle: "Everything you need in one place",
    },
    {
      title: "Get Started",
      subtitle: "Ready to begin your journey?",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-stretch sm:items-center px-1 sm:px-4">
      <div className="bg-white shadow-xl w-full max-w-md sm:max-w-4xl min-h-full sm:min-h-[600px] flex flex-col sm:flex-row overflow-hidden rounded-lg relative">
        {/* Left Section */}
        <div className="bg-gradient-to-br from-pink-500 to-purple-700 text-white p-8 text-center sm:w-1/2 flex flex-col justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img
              src="/EVO-Optigo-LOGO.png"
              alt="evo logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="flex justify-center space-x-2 mb-6" id="step-dots">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-purple-300"></div>
            <div className="w-2 h-2 rounded-full bg-purple-300"></div>
          </div>
          <h1 className="text-2xl font-bold mb-2" id="step-title">
            {steps[0].title}
          </h1>
          <p className="text-purple-100" id="step-subtitle">
            {steps[0].subtitle}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex-1 w-full sm:w-1/2">
          <Swiper
            spaceBetween={10}
            navigation={{
              nextEl: "#nextBtn",
              prevEl: "#prevBtn",
            }}
            onSlideChange={(swiper) => {
              const current = swiper.activeIndex;
              document.getElementById("step-title").textContent =
                steps[current].title;
              document.getElementById("step-subtitle").textContent =
                steps[current].subtitle;

              const dots = document.querySelectorAll("#step-dots div");
              dots.forEach((dot, index) => {
                dot.classList.toggle("bg-yellow-400", index <= current);
                dot.classList.toggle("bg-purple-300", index > current);
              });
            }}
            className="swiper mySwiper h-[500px]"
          >
            {/* Slide 1 */}
            <SwiperSlide>
              <p className="text-center text-gray-600 text-md sm:text-lg leading-relaxed mb-4">
                Evoapp streamlines your entire jewelry business, from
                procurement and inventory to sales and customer relationship
                management. We empower jewelers to achieve greater efficiency
                and profitability.
              </p>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
              <p className="text-center text-gray-600 text-md sm:text-lg leading-relaxed mb-4">
                Discover powerful tools for inventory management, sales
                tracking, customer relations, and business analytics.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
                {/* Feature cards with Lucide icons */}
                <div className="border-l-4 border-yellow-400 py-3 px-2 bg-white rounded shadow text-center">
                  <div className="text-purple-600 mb-2">
                    <ServerOff className="w-6 h-6 mx-auto" />
                  </div>
                  <span className="text-xs sm:text-md font-medium text-gray-700">
                    Offline Mode Capability
                  </span>
                </div>
                <div className="border-l-4 border-yellow-400 py-3 px-2 bg-white rounded shadow text-center">
                  <div className="text-purple-600 mb-2">
                    <ShoppingBag className="w-6 h-6 mx-auto" />
                  </div>
                  <span className="text-xs sm:text-md font-medium text-gray-700">
                    Real-Time Order
                  </span>
                </div>
                <div className="border-l-4 border-yellow-400 py-3 px-2 bg-white rounded shadow text-center">
                  <div className="text-purple-600 mb-2">
                    <QrCode className="w-6 h-6 mx-auto" />
                  </div>
                  <span className="text-xs sm:text-md font-medium text-gray-700">
                    Integrated Scanning
                  </span>
                </div>
                <div className="border-l-4 border-yellow-400 py-3 px-2 bg-white rounded shadow text-center">
                  <div className="text-purple-600 mb-2">
                    <ClipboardList className="w-6 h-6 mx-auto" />
                  </div>
                  <span className="text-xs sm:text-md font-medium text-gray-700">
                    Cart Summary
                  </span>
                </div>
                <div className="border-l-4 border-yellow-400 py-3 px-2 bg-white rounded shadow text-center">
                  <div className="text-purple-600 mb-2">
                    <UserCheck className="w-6 h-6 mx-auto" />
                  </div>
                  <span className="text-xs sm:text-md font-medium text-gray-700">
                    Customer Mgmt
                  </span>
                </div>
                <div className="border-l-4 border-yellow-400 py-3 px-2 bg-white rounded shadow text-center">
                  <div className="text-purple-600 mb-2">
                    <Lock className="w-6 h-6 mx-auto" />
                  </div>
                  <span className="text-xs sm:text-md font-medium text-gray-700">
                    Secure Ops
                  </span>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 3 */}
            <SwiperSlide>
              <p className="text-center text-gray-600 text-md sm:text-lg leading-relaxed mb-4">
                Let's set up your account and get you started with Evoapp. It
                only takes a few minutes!
              </p>
              <div className="space-y-4 mb-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Quick 5-minute setup</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">
                    No technical knowledge required
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Support Mon–Sat</span>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center px-4 py-2">
            <button
              id="prevBtn"
              className="text-black p-2 rounded hover:bg-gray-200 transition"
            >
              <i data-lucide="chevron-left" className="w-6 h-6"></i>
            </button>
            <button
              id="nextBtn"
              className="text-black p-2 rounded hover:bg-gray-200 transition"
            >
              <i data-lucide="chevron-right" className="w-6 h-6"></i>
            </button>
          </div>

          {/* Final Button */}
          <div className="px-4 mt-4 mb-4">
            <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
              <a
                target="_blank"
                href="https://helloapp.optigoapps.com/?cc=COMP167&ec=COMP167&newlead"
              >
                Generate Inquiry
              </a>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="block sm:hidden p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-t-lg sticky bottom-0 z-50">
          Powered by{" "}
          <span className="font-semibold text-purple-600">
            Orail OptigoApps
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
