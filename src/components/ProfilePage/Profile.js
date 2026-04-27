// import React, { useEffect, useState } from "react";
// import "./Profile.scss";
// import { Button, Card, Avatar, Typography, Divider } from "@mui/material";
// import { House } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { CallApi } from "../../API/CallApi/CallApi";
// import LoadingBackdrop from "../../Utils/LoadingBackdrop";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [profileData, setProfileData] = useState(null);

  // const GetCustomerData = async () => {
  //   setLoading(true);
  //   const Device_Token = sessionStorage.getItem("device_token");

  //   const body = {
  //     Mode: "GetProfileData",
  //     Token: `"${Device_Token}"`,
  //     ReqData: JSON.stringify([
  //       {
  //         ForEvt: "GetProfileData",
  //         DeviceToken: Device_Token,
  //         AppId: 3,
  //       },
  //     ]),
  //   };

  //   const response = await CallApi(body);
  //   if (response?.DT) {
  //     setProfileData(response.DT[0]);
  //   }
  //   setLoading(false);
  // };

  // useEffect(() => {
  //   GetCustomerData();
  // }, []);

//   return (
//     <div className="profile-container">
// <LoadingBackdrop isLoading={loading} />
// <div className="Header_main">
//   <div className="header-container">
//     <p className="header_title">Profile</p>
//     <Button
//       className="AddCustomer_Btn"
//       onClick={() => navigate("/")}
//       variant="contained"
//     >
//       <House />
//     </Button>
//   </div>
// </div>

//       {profileData && (
//         <Card className="profile-card" elevation={3}>
//           <div className="profile-avatar">
//             <Avatar
//               alt="Profile"
//               src={profileData?.ImagePath || "/default-avatar.png"}
//               sx={{ width: 80, height: 80 }}
//             />
//           </div>
//           <Typography variant="h6" className="profile-name">
//             {profileData.firstname} {profileData.lastname}
//           </Typography>
//           <Typography variant="body2" className="profile-email">
//             {profileData.userid}
//           </Typography>

//           <Divider className="profile-divider" />

//           <div className="profile-info">
//             <p>
//               <strong>Customer Code:</strong> {profileData.customercode}
//             </p>
//             <p>
//               <strong>Company:</strong> {profileData.DefCompanyName}
//             </p>
//             <p>
//               <strong>Device Name:</strong> {profileData.DeviceName}
//             </p>
//             <p>
//               <strong>Expiry Date:</strong> {profileData.ExpiryDate}
//             </p>
//             <p>
//               <strong>Company Code:</strong> {profileData.CompanyCode}
//             </p>
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default Profile;

import React, { useEffect, useState } from "react";
import "./Profile.scss";
import {
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaRegBuilding } from "react-icons/fa";
import { MdEmail, MdOutlineAccountCircle } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import { House } from "lucide-react";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { CallApi } from "../../API/CallApi/CallApi";

const Profile = () => {
  const [allProfileData, setAllProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const GetCustomerData = async () => {
    setIsLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");

    const body = {
      Mode: "GetProfileData",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "GetProfileData",
          DeviceToken: Device_Token,
          AppId: 3,
        },
      ]),
    };

    const response = await CallApi(body);
    if (response?.DT) {
      sessionStorage.setItem("profileData" , JSON.stringify(response.DT[0]));
      setAllProfileData(response.DT[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      setAllProfileData(JSON.parse(storedProfileData));
    }else{
      GetCustomerData();
    }
  }, []);

  const handleLogoutConfirm = () => {
    navigate("/logout", { replace: true });
    setOpenLogoutDialog(false);
    sessionStorage.clear();
    Cookies.remove("device_token");
    Cookies.remove("token");
    Cookies.remove("SV");
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const HandleDeleteAccount = async () => {
    window.history.pushState({}, "", "/account-delete");
    sessionStorage.clear();
    window.location.reload();
    // navigate("/account-delete", { replace: true });
  };

  const HandleDeleteAccountOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <div className="profile_main_div">
      <LoadingBackdrop isLoading={isLoading} />
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Profile</p>
          <Button
            className="AddCustomer_Btn"
            onClick={() => navigate("/")}
            variant="contained"
          >
            <House />
          </Button>
        </div>
      </div>
      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-confirmation-dialog"
      >
        <p id="logout-confirmation-dialog">
          Are you sure you want to logout?
        </p>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleLogoutCancel}
            className="Account_delete_button"
          >
            No
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            className="Account_delete_button"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleDeleteCancel}
            className="Account_delete_button"
          >
            Cancel
          </Button>
          <Button
            onClick={HandleDeleteAccount}
            autoFocus
            className="Account_delete_button"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {!isLoading && (
        <div>
          <div
            className="profile-container"
            style={{ padding: "80px 20px 30px 20px" }}
          >
            <div
              className="profile-picture"
              style={{
                textAlign: "center",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={
                    allProfileData?.ImagePath ||
                    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                  }
                  alt="Profile"
                  onError={(e) => {
                    e.target.src =
                      "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
                  }}
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                  }}
                />

                <div className="profileFiled_div_name">
                  <label className="profile_textfile_label_value_name">
                    {allProfileData?.firstname} {allProfileData?.lastname}
                  </label>
                  <label className="profile_textfile_label_value_UserID">
                    {allProfileData?.userid}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="profile_deatil_top_main">
            {allProfileData && (
              <div className="profile_deatil_top">
                {allProfileData?.DefCompanyName && (
                  <div className="profileFiled_div">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <FaRegBuilding
                        style={{ height: "20px", width: "20px" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label className="profile_textfile_label_value">
                        {allProfileData?.DefCompanyName} (
                        {allProfileData?.CompanyCode})
                      </label>
                    </div>
                  </div>
                )}

                {allProfileData?.userid && (
                  <div className="profileFiled_div">
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <MdEmail style={{ height: "20px", width: "20px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label className="profile_textfile_label_value">
                        {allProfileData?.userid}
                      </label>
                    </div>
                  </div>
                )}

                {allProfileData?.MobileNo && (
                  <div className="profileFiled_div_last">
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <FaPhoneAlt style={{ height: "20px", width: "20px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label className="profile_textfile_label_value">
                        {allProfileData?.MobileNo}
                      </label>
                    </div>
                  </div>
                )}

                <div className="profileFiled_div_last_Delete">
                  <div
                    className="profileFiled_div_last_Delete_sub"
                    onClick={HandleDeleteAccountOpen}
                  >
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <MdOutlineAccountCircle
                        style={{
                          height: "20px",
                          width: "20px",
                          color: "white",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label
                        className="profile_textfile_label_value"
                        style={{ color: "white" }}
                      >
                        DELETE MY ACCOUNT
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="profile_logoutBtn_div">
            <Button
              variant="contained"
              className="profile_logout_btn"
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
