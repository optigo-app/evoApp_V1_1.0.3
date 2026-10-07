import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoadingBackdrop from "./Utils/LoadingBackdrop";
import Profile from "./components/ProfilePage/Profile";
import { ToastContainer } from "./Utils/Tostify/ToastManager";
import OrderSuccess from "./Page/OrderSucess/OrderSuccess";
import Support from "./components/Support/Support";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy";
import Register from "./components/Register/Register";
import FeedBack from "./components/FeedBack/FeedBack";
import AccountDeleteStep from "./Page/AccountDelete/AccountDeleteStep";
import PritnModel from "./components/JobScanPage/Scanner/PritnModel/PritnModel";
import EstimateSuccess from "./Page/EstimateSuccess/EstimateSuccess";

const Customer = lazy(() => import("./components/Customer/Customer"));
const AddCustomer = lazy(() => import("./components/AddCustomer/AddCustomer"));
const JobScanPage = lazy(() => import("./components/JobScanPage/JobScanPage"));

function App() {
  // http://localhost:3000/?&device_token=TDHYM68F1B30DKRL&yearCode=e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19&SpVer=V1&AppVer=1.0.0   Local
  // https://evo.optigoapps.com/V1/?&device_token=91LD3H47W6111YMK&SpVer=V1&AppVer=1.0.0   //test76
  // http://nzen/evo/?&device_token=94VV7I2Z3TU888I4&SpVer=V1&AppVer=1.0.0

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const device_token = queryParams.get("device_token");
    const token = queryParams.get("token");
    const SV = queryParams.get("SV");
    const SpVer = queryParams.get("SpVer");
    const yearCode = queryParams.get("yearCode");
    const AppVer = queryParams.get("AppVer");

    if (device_token !== undefined && device_token !== null) {
      sessionStorage.setItem("device_token", device_token);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("SV", SV);
      sessionStorage.setItem("yearCode", yearCode);
      sessionStorage.setItem("SpVer", SpVer);
      sessionStorage.setItem("AppVer", AppVer);
      sessionStorage.setItem("isLogin", true);
    }
  }, []);

  function getBaseName() {
    const path = window.location.pathname;
    const firstSegment = path.split("/").filter(Boolean)[0];
    return firstSegment ? `/${firstSegment}` : "/";
  }

  return (
    <BrowserRouter basename={getBaseName()}>
      <ToastContainer />
      <Suspense fallback={<LoadingBackdrop />}>
        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/JobScanPage" element={<JobScanPage />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/orderSuccess" element={<OrderSuccess />} />
          <Route path="/estimateSuccess" element={<EstimateSuccess />} />
          <Route path="/Support" element={<Support />} />
          <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<FeedBack />} />
          <Route path="/PritnModel" element={<PritnModel />} />
          <Route path="/steps-account-delete" element={<AccountDeleteStep />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
export default App;


// //basename="/evo"
// //"homepage": "/evo",
// // R77HF9W40K7QE918  Demo copy token


// 1/8804
// 1/8849
// 1/806
// 1/801