// import React from 'react'
// import Scanner from '../src/components/JobScanPage/Scanner/Scanner';
// import PritnModel from './components/JobScanPage/Scanner/PritnModel/PritnModel';

// const App = () => {
//   return (
//     <div>
//       <Scanner />
//       {/* <PritnModel /> */}
//     </div>
//   )
// }

// export default App

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
  //  http://localhost:3000/?&device_token=BJL9401C9BL10JE8&SpVer=V1&AppVer=1.0.0   Local
  //  http://localhost:3000/?&device_token=R77HF9W40K7QE918   online demo
  //  https://8b003b09fd6c.ngrok-free.app/?&device_token=G3B8J4007CJ8LJJZ  test73
  //  https://8b003b09fd6c.ngrok-free.app/?&device_token=CDB7QR8RZIVDC3WA  test74
  // https://3bbc-103-206-139-196.ngrok-free.app/?&device_token=CDB7QR8RZIVDC3WA&SpVer=V1
  // https://evo.optigoapps.com/V1/?&device_token=CDB7QR8RZIVDC3WA&SpVer=V1&AppVer=1.0.0

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const device_token = queryParams.get("device_token");
    const token = queryParams.get("token");
    const SV = queryParams.get("SV");
    const SpVer = queryParams.get("SpVer");
    const AppVer = queryParams.get("AppVer");

    if (device_token !== undefined && device_token !== null) {
      sessionStorage.setItem("device_token", device_token);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("SV", SV);
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