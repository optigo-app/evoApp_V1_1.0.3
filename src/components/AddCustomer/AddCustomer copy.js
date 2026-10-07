import React, { useState, useEffect } from "react";
import "./AddCustomer.scss";
import {
  Button,
  Modal,
  Box,
  TextField,
  Collapse,
  Typography,
  Link,
  IconButton,
  Divider,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { House, Save, UserPlus, X } from "lucide-react";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import { showToast } from "../../Utils/Tostify/ToastManager";
import { CallApi } from "../../API/CallApi/CallApi";

const AddCustomer = () => {
  const [input, setInput] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

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

  // Load MobileCountryCode master data once on mount:
  // - Dropdown list only shows entries where IsActive === 1
  // - Default selected entry is the one where IsDefault === 1
  //   (falls back to the first active entry if none is marked default)
  useEffect(() => {
    let masterData = [];
    try {
      masterData =
        JSON.parse(sessionStorage.getItem("MobileCountryCode")) || [];
    } catch (e) {
      masterData = [];
    }

    const activeCountries = (masterData || []).filter(
      (c) => Number(c.IsActive) === 1
    );

    const defaultCountry =
      activeCountries.find((c) => Number(c.IsDefault) === 1) ||
      masterData.find((c) => Number(c.IsDefault) === 1) ||
      activeCountries[0] ||
      null;

    setCountryList(activeCountries);
    setSelectedCountry(defaultCountry);
  }, []);

  const phoneLength = selectedCountry?.PhoneLength || 10;

  const handleSearch = async () => {
    setLoading(false);
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError("Mobile or Email is required.");
      return;
    }

    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedInput);
    const isMobile = new RegExp(`^[0-9]{${phoneLength}}$`).test(trimmedInput);

    if (!isEmail && !isMobile) {
      setError(`Please enter a valid ${phoneLength}-digit mobile number or email.`);
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
        icon: "info"
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

  // Called when the user picks a different country code from the dropdown
  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    const country = countryList.find((c) => c.id === countryId) || null;
    setSelectedCountry(country);

    // Trim the currently entered mobile number to the new country's PhoneLength
    setForm((prevForm) => ({
      ...prevForm,
      mobile: prevForm.mobile.slice(0, country?.PhoneLength || 10),
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      mobile: "",
    }));
  };

  const handleModalSave = async () => {
    const errors = {};

    // Regex definitions
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const lastNameRegex = /^[A-Za-z\s]{0,50}$/;
    const mobileRegex = new RegExp(`^\\d{${phoneLength}}$`);
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
      errors.mobile = `Enter a valid ${phoneLength}-digit mobile number`;
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

    // if (form.pincode && !pincodeRegex.test(form.pincode.trim())) {
    //   errors.pincode = "Enter 5 or 6 digit pincode";
    // }

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
          ForEvt: "CustomerRegister",
          DeviceToken: Device_Token,
          AppId: "3",
          FirstName: form.firstName,
          LastName: form.lastName,
          CustMobile: form.mobile,
          MobileCountryCode: selectedCountry?.mobileprefix || "",
          Mobile_Countryid: selectedCountry?.id || "",
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
        Mode: "CustomerRegister",
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
              fontColor: "white",
              duration: 5000,
              icon: "success"
            });
          }
          setLoading(false);
        }
        navigate(`/JobScanPage`);
        setLoading(false);
        setOpenModal(false);
      } else {
        setLoading(false);
        showToast({
          message: response?.DT[0]?.stat_msg,
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "#fff",
          duration: 5000,
          icon: "remove"
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
        showToast({
          message: "Session Started Customer on Floor",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "#fff",
          duration: 5000,
          icon: "success"
        });
        sessionStorage.setItem(
          "curruntActiveCustomer",
          JSON.stringify(foundCustomer)
        );
      }
    }
    navigate(`/JobScanPage`);
  };

  return (
    <div className="AddCustomerContainer">
      <LoadingBackdrop isLoading={loading} />
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Add Customer</p>
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
              Enter mobile number or email
            </p>
            <TextField
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
          <Button className="addFormBtn" onClick={handleSearch}>
            Processed
          </Button>
        </div>

        {foundCustomer && (
          <div className="result-section">
            <h4>Available Customer</h4>

            <Button
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
            </Button>
          </div>
        )}

        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          disableRestoreFocus
          sx={{
            outline: "none",
            alignItems: "flex-end",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box className="addCustomer_modalbox">
            <Box className="modal-header">
              <Box className="modal-header__left">
                <Box className="modal-header__icon">
                  <UserPlus size={16} color="#2E7D32" />
                </Box>
                <Typography className="modal-header__title">
                  Add new customer
                </Typography>
              </Box>
              <IconButton
                onClick={() => setOpenModal(false)}
                className="modal-close-btn"
                size="small"
              >
                <X size={14} />
              </IconButton>
            </Box>

            {/* ── Scrollable Body ── */}
            <Box className="modal-body">

              <Typography className="section-label">Basic info</Typography>

              {/* Name row */}
              <Box className="field-row">
                <TextField
                  label="First name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleFormChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleFormChange}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  size="small"
                  fullWidth
                />
              </Box>

              <TextField
                fullWidth
                label="Email address"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                size="small"
              />

              {/* Mobile number with country-code dropdown */}
              <TextField
                fullWidth
                label="Mobile number"
                name="mobile"
                value={form.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // allow only digits
                  if (value.length <= phoneLength) {
                    handleFormChange({
                      target: { name: "mobile", value },
                    });
                  }
                }}
                error={!!formErrors.mobile}
                helperText={
                  formErrors.mobile ||
                  `${form.mobile.length}/${phoneLength} digits`
                }
                size="small"
                inputProps={{ inputMode: "numeric", maxLength: phoneLength }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0 }}>
                      <Select
                        variant="standard"
                        disableUnderline
                        value={selectedCountry?.id || ""}
                        onChange={handleCountryChange}
                        sx={{
                          minWidth: 90,
                          fontSize: "14px",
                          "& .MuiSelect-select": { paddingRight: "24px !important" },
                        }}
                        renderValue={() =>
                          selectedCountry
                            ? `${selectedCountry.CountryShortName} +${selectedCountry.mobileprefix}`
                            : "Select"
                        }
                      >
                        {countryList.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.countryname} (+{c.mobileprefix})
                          </MenuItem>
                        ))}
                      </Select>
                    </InputAdornment>
                  ),
                }}
              />

              <Divider />

              {/* Address section */}
              <Typography className="section-label">
                Address
                <span className="section-label__optional"> — optional</span>
              </Typography>

              {!showMore && (
                <Link
                  component="button"
                  underline="none"
                  className="show-more-link"
                  onClick={() => setShowMore(true)}
                >
                  + Show address fields
                </Link>
              )}

              <Collapse in={showMore}>
                <Box className="extra-fields">
                  <Box className="field-row">
                    <TextField label="Country" name="country" value={form.country}
                      onChange={handleFormChange} size="small" fullWidth />
                    <TextField label="State" name="state" value={form.state}
                      onChange={handleFormChange} size="small" fullWidth />
                  </Box>
                  <Box className="field-row">
                    <TextField label="City" name="city" value={form.city}
                      onChange={handleFormChange} size="small" fullWidth />
                    <TextField
                      label="Pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // digits only
                        handleFormChange({ target: { name: "pincode", value } });
                      }}
                      error={!!formErrors.pincode}
                      helperText={formErrors.pincode}
                      size="small"
                      inputProps={{ inputMode: "numeric" }}
                      fullWidth
                    />
                  </Box>
                  <TextField fullWidth label="Area / Locality" name="area"
                    value={form.area} onChange={handleFormChange} size="small" />
                  <TextField fullWidth label="Full address" name="fullAddress"
                    value={form.fullAddress} onChange={handleFormChange} size="small" />

                  <Link component="button" underline="none"
                    className="show-more-link show-more-link--hide"
                    onClick={() => setShowMore(false)}>
                    − Hide address fields
                  </Link>
                </Box>
              </Collapse>

            </Box>

            <Box className="modal-footer">
              <Button
                variant="contained"
                fullWidth
                onClick={handleModalSave}
                className="save-btn"
                startIcon={<Save size={15} />}
              >
                Save & Start Session
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default AddCustomer;