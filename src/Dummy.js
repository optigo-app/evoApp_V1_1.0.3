import React, { useState } from "react";
import { House, X } from "lucide-react";
import { CallApi } from "./API/CallApi/CallApi";
import { showToast } from "./Utils/Tostify/ToastManager";
import '../src/components/AddCustomer/AddCustomer.scss'

const AddCustomer = () => {
  const [input, setInput] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    area: "",
    fullAddress: "",
  });

  const handleSearch = async () => {
    setLoading(false);
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError("Mobile or Email is required.");
      return;
    }

    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedInput);
    const isMobile = /^[0-9]{10}$/.test(trimmedInput);

    if (!isEmail && !isMobile) {
      setError("Please enter a valid mobile number or email.");
      return;
    }

    setError(""); // Clear error
    const Device_Token = sessionStorage.getItem("device_token");
    const VerifyMode = isEmail ? "email" : "mobile";
    const LoginID = trimmedInput;

    const body = {
      Mode: "VerifyEmailMobile",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "VerifyEmailMobile",
          DeviceToken: Device_Token,
          VerifyMode,
          LoginID,
          AppId: 3,
        },
      ]),
    };

    const response = await CallApi(body);
    setLoading(false);

    if (response?.DT[0]?.stat == 1) {
      setForm({
        firstName: "",
        lastName: "",
        email: isEmail ? trimmedInput : "",
        mobile: isMobile ? trimmedInput : "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        area: "",
        fullAddress: "",
      });
      setLoading(false);
      setOpenModal(true);
    } else {
      setLoading(false);
      setInput("");
      showToast({
        message: "Customer Allready Available",
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
        fontColor: "#fff",
        duration: 5000,
      });
      setFoundCustomer(response?.DT[0]);
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleModalSave = async () => {
    const errors = {};

    // Regex definitions
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const lastNameRegex = /^[A-Za-z\s]{0,50}$/;
    const mobileRegex = /^\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cityRegex = /^[A-Za-z\s]{2,50}$/;
    const areaRegex = /^[A-Za-z0-9\s]{2,100}$/;
    const stateRegex = /^[A-Za-z\s]{2,50}$/;
    const pincodeRegex = /^\d{5,6}$/;
    const addressRegex = /^.{5,200}$/;

    // Required fields
    if (!form.firstName.trim()) {
      errors.firstName = "First Name is required";
    } else if (!nameRegex.test(form.firstName.trim())) {
      errors.firstName = "Only letters and spaces (2–50 chars)";
    }

    if (form.lastName.trim() && !lastNameRegex.test(form.lastName.trim())) {
      errors.lastName = "Only letters and spaces (up to 50 chars)";
    }

    if (!form.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!mobileRegex.test(form.mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (form.city && !cityRegex.test(form.city.trim())) {
      errors.city = "Only letters and spaces allowed (2–50 chars)";
    }

    if (form.state && !stateRegex.test(form.state.trim())) {
      errors.state = "Only letters and spaces allowed (2–50 chars)";
    }

    if (form.area && !areaRegex.test(form.area.trim())) {
      errors.area = "Alphanumeric + spaces (2–100 chars)";
    }

    if (form.pincode && !pincodeRegex.test(form.pincode.trim())) {
      errors.pincode = "Enter 5 or 6 digit pincode";
    }

    if (form.fullAddress && !addressRegex.test(form.fullAddress.trim())) {
      errors.fullAddress = "Address should be 5–200 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      setLoading(true);
      const Device_Token = sessionStorage.getItem("device_token");
      const reqData = [
        {
          ForEvt: "CutomerRegister",
          DeviceToken: Device_Token,
          AppId: "3",
          FirstName: form.firstName,
          LastName: form.lastName,
          CustMobile: form.mobile,
          CustEmail: form.email,
          Area: form.area,
          City: form.city,
          State: form.state,
          Country: form.country,
          PinCode: form.pincode,
          Address: form.fullAddress,
        },
      ];

      const body = {
        Mode: "CutomerRegister",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify(reqData),
      };

      const response = await CallApi(body);
      if (response?.DT[0]?.stat == 1) {
        const saveData = {
          firstname: form.firstName,
          lastname: form.lastName,
          contactNumber: form.mobile,
          CustEmail: form.email,
          CustomerId: response?.DT[0]?.CustomerId,
          IsVisitor: response?.DT[0]?.IsVisitor,
        };
        sessionStorage.setItem(
          "curruntActiveCustomer",
          JSON.stringify(saveData)
        );

        const Device_Token = sessionStorage.getItem("device_token");
        const body = {
          Mode: "SetCustomerOnFloor",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "SetCustomerOnFloor",
              DeviceToken: Device_Token,
              CustomerId: response?.DT[0]?.CustomerId,
              AppId: 3,
            },
          ]),
        };

        const response2 = await CallApi(body);
        if (response2?.DT[0]?.stat == 1) {
          localStorage.removeItem("AllScanJobData");
          const body = {
            Mode: "StartSession",
            Token: `"${Device_Token}"`,
            ReqData: JSON.stringify([
              {
                ForEvt: "StartSession",
                DeviceToken: Device_Token,
                CustomerId: response?.DT[0]?.CustomerId,
                IsVisitor: response?.DT[0]?.IsVisitor,
                AppId: 3,
              },
            ]),
          };

          const response3 = await CallApi(body);
          if (response3?.DT[0]?.stat == 1) {
            showToast({
              message: "Customer Session Start",
              bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
              fontColor: "#fff",
              duration: 5000,
            });
          }
          setLoading(false);
        }
        setLoading(false);
        setOpenModal(false);
      } else {
        setLoading(false);
        showToast({
          message: response?.DT[0]?.stat_msg,
          bgColor: response?.DT[0]?.stat == 0 ? "red" : "#4caf50",
          fontColor: "#fff",
          duration: 5000,
        });
      }

      setFoundCustomer({
        customerName: `${form.firstName} ${form.lastName}`,
        ...form,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const handleNaviagte = async () => {
    setLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");
    const body = {
      Mode: "SetCustomerOnFloor",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "SetCustomerOnFloor",
          DeviceToken: Device_Token,
          CustomerId: foundCustomer?.CustomerId,
          AppId: 3,
        },
      ]),
    };
    const response = await CallApi(body);
    if (response?.DT[0]?.stat == 1) {
      // showToast({
      //   message: "Now Customer OnFloor End Session Start",
      //   bgColor: "#4caf50",
      //   fontColor: "#fff",
      //   duration: 5000,
      // });
      localStorage.removeItem("AllScanJobData");

      const body = {
        Mode: "StartSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "StartSession",
            DeviceToken: Device_Token,
            CustomerId: foundCustomer?.CustomerId,
            IsVisitor: foundCustomer?.IsVisitor,
            AppId: 3,
          },
        ]),
      };

      const response = await CallApi(body);
      setLoading(false);
      if (response?.DT[0]?.stat == 1) {
        // showToast({
        //   message: "Customer Session Start",
        //   bgColor: "#4caf50",
        //   fontColor: "#fff",
        //   duration: 5000,
        // });
        showToast({
          message: "Session Started Customer on Floor",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "#fff",
          duration: 5000,
        });
        sessionStorage.setItem(
          "curruntActiveCustomer",
          JSON.stringify(foundCustomer)
        );
      }
    }
  };

  return (
    <div className="AddCustomerContainer">
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Add Customer</p>
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              className="AddCustomer_Btn"
              variant="contained"
            >
              <House />
            </button>
          </div>
        </div>
      </div>

      <div className="AddCustomer_sub">
        <div className="form-section">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{ fontSize: "20px", textAlign: "center", fontWeight: 600 }}
            >
              Welcome To NIC
            </p>
            <p style={{ fontSize: "16px", textAlign: "center", margin: "0px" }}>
              We are happy to have you here. Register here to get in touch with
              us.
            </p>
          </div>

          <div style={{ marginTop: "30px" }}>
            <p style={{ margin: "0px", fontSize: "14px", fontWeight: 600 }}>
              Please Enter Valid Mobile Or Email
            </p>
            <input
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              error={!!error}
              helperText={error}
            />
          </div>
          <button className="addFormBtn" onClick={handleSearch}>
            Save
          </button>
        </div>

        {foundCustomer && (
          <div className="result-section">
            <h4>Available Customer</h4>

            <button
              className="customercard_button"
              onClick={() => handleNaviagte(foundCustomer)}
            >
              <div className="card-header">
                <div>
                  <h5>
                    {foundCustomer.firstname} {foundCustomer?.lastname}
                  </h5>
                  <p className="text-muted">
                    <strong>Customer Code:</strong> {foundCustomer.customercode}
                  </p>
                  <p className="text-muted">Mobile: {foundCustomer.mobileno}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "#b5aeae" }}>
                  Click To Select
                </p>
              </div>
            </button>
          </div>
        )}
{/* 
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          style={{ outline: "none" }}
        >
          <Box className="addCustomer_modalbox">
            <p style={{ fontSize: "19px", fontWeight: 600 }}>
              Add New Customer
            </p>
            <button
              onClick={() => setOpenModal(false)}
              style={{
                position: "absolute",
                right: "15px",
                top: "10px",
                color: "black",
                margin: "0px",
                padding: "0px",
                minWidth: "25px",
                height: "25px",
                border: "1px solid black",
                borderRadius: "20px",
              }}
            >
              <X />
            </button>

            <input
              fullWidth
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              sx={{
                "& .MuiFormHelperText-root": {
                  marginLeft: "0px !important",
                },
              }}
            />

            <input
              fullWidth
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              sx={{
                "& .MuiFormHelperText-root": {
                  marginLeft: "0px !important",
                },
              }}
            />

            <input
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{
                "& .MuiFormHelperText-root": {
                  marginLeft: "0px !important",
                },
              }}
            />

            <input
              fullWidth
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleFormChange}
              margin="dense"
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
              sx={{
                "& .MuiFormHelperText-root": {
                  marginLeft: "0px !important",
                },
              }}
            />

            {!showMore && (
              <Link
                component="button"
                variant="body2"
                sx={{ mt: 1, mb: 1 }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Hide Extra Fields" : "Show More"}
              </Link>
            )}

            <Collapse in={showMore}>
              <input
                fullWidth
                label="Country"
                name="country"
                value={form.country}
                onChange={handleFormChange}
                margin="dense"
              />
              <input
                fullWidth
                label="State"
                name="state"
                value={form.state}
                onChange={handleFormChange}
                margin="dense"
              />
              <input
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleFormChange}
                margin="dense"
              />
              <input
                fullWidth
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleFormChange}
                margin="dense"
              />
              <input
                fullWidth
                label="Area"
                name="area"
                value={form.area}
                onChange={handleFormChange}
                margin="dense"
              />
              <input
                fullWidth
                label="Full Address"
                name="fullAddress"
                value={form.fullAddress}
                onChange={handleFormChange}
                margin="dense"
              />
            </Collapse>

            {showMore && (
              <Link
                component="button"
                variant="body2"
                sx={{ mt: 1, mb: 1 }}
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Hide Extra Fields" : "Show More"}
              </Link>
            )}

            <button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleModalSave}
              sx={{ mt: 2 }}
              className="addFormBtn"
            >
              Save
            </button>
          </Box>
        </Modal> */}
      </div>
    </div>
  );
};

export default AddCustomer;
