import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Customer.scss";
import {
  Button,
  Drawer,
  Box,
  Typography,
  Stack,
  Modal,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemText,
  List,
  Divider,
  Accordion,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineClockCircle,
  AiOutlineCloseCircle,
  AiOutlineDown,
  AiOutlineLock,
  AiOutlineRight,
  AiOutlineUp,
} from "react-icons/ai";
import { CallApi } from "../../API/CallApi/CallApi";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";
import {
  AlignJustify,
  CirclePlus,
  CircleUser,
  Plus,
  RotateCcw,
} from "lucide-react";
import { showToast } from "../../Utils/Tostify/ToastManager";
import CustomAvatar from "../../Utils/avatar";
import logo from "../../assests/80-40.png";
import Cookies from "js-cookie";
import { FaChevronRight } from "react-icons/fa";
import dummyProfile from '../../assests/profile.png';

const formatSecondsToTime = (seconds) => {
  if (typeof seconds === "string" && seconds.includes(":")) {
    return seconds;
  }
  const safeSeconds = parseInt(seconds, 10);
  if (isNaN(safeSeconds) || safeSeconds < 0) return "00:00:00";
  const h = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(safeSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "auto",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const styleEndBox = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  height: "auto",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const Customer = () => {
  const [mainData, setMainData] = useState([]);
  const [result, setResult] = useState([]);
  const [search, setSearch] = useState("");
  const [timers, setTimers] = useState({});
  const [stopped, setStopped] = useState({});
  const [endCustomnerInfo, setEndCustomerInfo] = useState();
  const [endReleseCust, setEndReleseCust] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [tabsFixed, setTabsFixed] = useState(false);
  const headerRef = useRef(null);
  const [allProfileData, setAllProfileData] = useState();
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const cardRefs = useRef({});
  const expandedSectionRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    navigator?.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        window._cachedCameraStream = stream;
      })
      .catch((err) => {
        console.error("Camera init failed:", err);
      });
  }, []);

  const GetProfileData = async () => {
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
    if (response?.DT[0]?.stat == 1) {
      setAllProfileData(response.DT[0]);
      sessionStorage.setItem("profileData", JSON.stringify(response.DT[0]));
      sessionStorage.setItem("EvoSetting", JSON.stringify(response.DT1));
    }
  };

  const GetCustomerData = async () => {
    setLoading(true);
    const Device_Token = sessionStorage.getItem("device_token");

    const body = {
      Mode: "GetCustomerData",
      Token: `"${Device_Token}"`,
      ReqData: JSON.stringify([
        {
          ForEvt: "GetCustomerData",
          DeviceToken: Device_Token,
          AppId: 3,
        },
      ]),
    };

    const response = await CallApi(body);
    setMainData(response?.DT || []);
    setLoading(false);

    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      setAllProfileData(JSON.parse(storedProfileData));
    } else {
      GetProfileData();
    }
  };

  useEffect(() => {
    GetCustomerData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        mainData.forEach((cust) => {
          if (cust.IsLockTimer === 2 && !stopped[cust.CustomerId]) {
            let startTime = cust.StartDateTime;
            if (typeof startTime === "string" && startTime.includes(" ")) {
              startTime = startTime.replace(" ", "T");
            }
            const start = new Date(startTime).getTime();
            const now = Date.now();
            if (!isNaN(start)) {
              const diffSeconds = Math.floor((now - start) / 1000);
              updated[cust.CustomerId] = Math.max(0, diffSeconds);
            } else {
              updated[cust.CustomerId] = 0;
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mainData, stopped]);

  const toggleExpand = (customerId) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);

      setTimeout(() => {
        const card = cardRefs.current[customerId];
        const expanded = expandedSectionRefs.current[customerId];

        if (!card || !expanded) return;

        const cardRect = card.getBoundingClientRect();
        const expandRect = expanded.getBoundingClientRect();

        const isFullyVisible =
          expandRect.top >= 0 && expandRect.bottom <= window.innerHeight;

        if (!isFullyVisible) {
          const scrollOffset = expandRect.bottom - window.innerHeight + 20;
          window.scrollBy({
            top: scrollOffset,
            behavior: "smooth",
          });
        }
      }, 200);
    }
  };

  const toggleDrawer = (newOpen) => () => {
    setOpenMenu(newOpen);
  };

  const HandleDeleteAccountOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const filtered = mainData.filter((item) =>
        item.firstname.toLowerCase().includes(search.toLowerCase())
      );
      setResult(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setResult([]);
  };

  const filteredData = result.length > 0 ? result : mainData;

  const sortedData = useMemo(() => {
    if (!filteredData) return [];
    return [...filteredData].sort((a, b) => {
      if (a.IsLockTimer === 2) return -1;
      if (b.IsLockTimer === 2) return 1;
      return 0;
    });
  }, [filteredData]);

  useEffect(() => {
    const runningCustomer = filteredData?.find(
      (cust) => cust.IsLockTimer === 2
    );
    if (runningCustomer) {
      setExpandedCustomerId(runningCustomer.CustomerId);
    } else {
      setExpandedCustomerId(null);
    }
  }, [filteredData]);

  const handleClickStatus = async (customer) => {
    if (customer?.IsLockTimer == 1) {
      showToast({
        message: "Allready In Session",
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
        fontColor: "#fff",
        duration: 3000,
      });
      return;
    }

    const isOtherRunning = mainData.some(
      (cust) =>
        cust.CustomerId !== customer.CustomerId &&
        cust.IsLockTimer === 2 &&
        !stopped[cust.CustomerId]
    );
    if (isOtherRunning) {
      showToast({
        message: "First End The Running Customer",
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
        fontColor: "#fff",
        duration: 3000,
      });
      return;
    }
    if (customer.IsLockTimer === 0) {
      const Device_Token = sessionStorage.getItem("device_token");
      const body = {
        Mode: "StartSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "StartSession",
            DeviceToken: Device_Token,
            CustomerId: customer?.CustomerId,
            IsVisitor: customer?.IsVisitor,
            AppId: 3,
          },
        ]),
      };

      const response = await CallApi(body);
      if (response?.DT[0]?.stat == 1) {
        showToast({
          message: "Customer Session Start",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 5000,
        });
        navigate(`/JobScanPage`);
        sessionStorage.setItem(
          "curruntActiveCustomer",
          JSON.stringify(customer)
        );
      } else {
      }
    } else if (customer.IsLockTimer === 2) {
      navigate(`/JobScanPage`);
      sessionStorage.setItem("curruntActiveCustomer", JSON.stringify(customer));
    }
  };

  const handleStop = async (customer) => {
    setOpen(true);
    setEndCustomerInfo(customer);
  };

  const handleExitCustomer = async (customer, endCustomer) => {
    const Device_Token = sessionStorage.getItem("device_token");

    if (endCustomer) {
      const body = {
        Mode: "EndSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "EndSession",
            DeviceToken: Device_Token,
            CustomerId: customer?.CustomerId,
            IsVisitor: customer?.IsVisitor,
            AppId: 3,
          },
        ]),
      };

      const response = await CallApi(body);
      if (response?.DT[0]?.stat == 1) {
        setStopped((prev) => ({ ...prev, [customer?.CustomerId]: true }));
        showToast({
          message: "Session closed.Tell us about your experience",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 5000,
        });
        localStorage.removeItem("AllScanJobData");
        navigate("/feedback");
        GetCustomerData();
      }
      setOpen(false);
    } else {
      const endSessionBody = {
        Mode: "EndSession",
        Token: `"${Device_Token}"`,
        ReqData: JSON.stringify([
          {
            ForEvt: "EndSession",
            DeviceToken: Device_Token,
            CustomerId: endCustomnerInfo?.CustomerId,
            IsVisitor: endCustomnerInfo?.IsVisitor,
            AppId: 3,
          },
        ]),
      };

      const endSessionResponse = await CallApi(endSessionBody);

      if (endSessionResponse?.DT[0]?.stat == 1) {
        setStopped((prev) => ({
          ...prev,
          [endCustomnerInfo?.CustomerId]: true,
        }));
        showToast({
          message: "Session closed.Tell us about your experience. ",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 3000,
        });

        const exitBody = {
          Mode: "ExitCustomer",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "ExitCustomer",
              DeviceToken: Device_Token,
              CustomerId: endCustomnerInfo?.CustomerId,
              IsVisitor: endCustomnerInfo?.IsVisitor,
              AppId: 3,
            },
          ]),
        };
        const exitResponse = await CallApi(exitBody);
        if (exitResponse?.DT[0]?.stat == 1) {
          localStorage.removeItem("AllScanJobData");
          setStopped((prev) => ({
            ...prev,
            [endCustomnerInfo?.CustomerId]: true,
          }));
          showToast({
            message: "Customer Exit Completed",
            bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "#fff",
            duration: 5000,
          });
          navigate("/feedback");
          GetCustomerData();
        }
        setOpen(false);
      }
    }
  };

  const isAnyRunning = mainData.some(
    (cust) => cust.IsLockTimer === 2 && !stopped[cust.CustomerId]
  );
  const handleNaviagte = () => {
    if (isAnyRunning) {
      showToast({
        message: "First End The Running Customer",
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
        fontColor: "#fff",
        duration: 5000,
      });
      return;
    }
    navigate("/AddCustomer");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setTabsFixed(headerBottom <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedProfileData = sessionStorage.getItem("profileData");
    if (storedProfileData) {
      setAllProfileData(JSON.parse(storedProfileData));
    }
  }, []);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const DrawerList = (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      role="presentation"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderBottom: "1px solid #eee",
        }}
      >
        <img
          src={allProfileData?.ImagePath || dummyProfile}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = dummyProfile;
          }}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <Box>
          <Typography fontWeight={600} fontSize={14}>
            {allProfileData?.firstname} {allProfileData?.lastname}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {allProfileData?.userid}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {allProfileData?.CompanyCode}
          </Typography>
        </Box>
      </Box>
      <List sx={{ flex: 1 }}>
        <ListItemButton
          sx={{ py: 1.5 }}
          onClick={() => {
            navigate("/support");
            setOpenMenu(false);
          }}
        >
          <ListItemText primary="Support" />
          <FaChevronRight size={14} />
        </ListItemButton>

        <Divider />

        <ListItemButton
          sx={{ py: 1.5 }}
          onClick={() => {
            navigate("/PrivacyPolicy");
            setOpenMenu(false);
          }}
        >
          <ListItemText primary="Privacy Policy" />
          <FaChevronRight size={14} />
        </ListItemButton>
      </List>

      <Box sx={{ borderTop: "1px solid #eee", p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          sx={{ mb: 1 }}
          onClick={handleLogoutClick}
        >
          Logout
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={HandleDeleteAccountOpen}
        >
          Delete My Account
        </Button>
      </Box>
    </Box>
  );


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

  const [zIndexValue, setZIndexValue] = useState(9);
  useEffect(() => {
    let timer;
    if (openMenu) {
      setZIndexValue(-1);
    } else {
      timer = setTimeout(() => {
        setZIndexValue(9);
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [openMenu]);

  const version = sessionStorage.getItem("AppVer");
  const SpVerShow =  sessionStorage.getItem("SpVer");
  
  return (
    <div className="CustomerMain">
      <LoadingBackdrop isLoading={loading} />

      <Drawer open={openMenu} onClose={() => setOpenMenu(false)}>
        {DrawerList}
        <p style={{
          position: 'absolute',
          bottom: '110px',
          right: '20px',
          fontSize: '15px',
          color: 'lightgray'
        }}>
          Version : {version} - {SpVerShow}
        </p>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          Confirm Logout
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", py: 1 }}>
          <Typography fontSize={14} color="text.secondary">
            Are you sure you want to log out of your account?
          </Typography>
        </DialogContent>

        <div
          style={{ display: 'flex', gap: '10px' }}
        >

          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogoutCancel}
            sx={{
              borderRadius: 2,
              py: 1.2,
              width: '50%',
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogoutConfirm}
            sx={{
              backgroundColor: "#ed4242",
              color: "#fff",
              borderRadius: 2,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              width: '50%',
              "&:hover": {
                backgroundColor: "#ed4242",
              },
            }}
          >
            Logout
          </Button>

        </div>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          Confirm Delete
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", py: 1 }}>
          <Typography fontSize={14} color="text.secondary">
            Are you sure you want to delete your account?
          </Typography>
        </DialogContent>

        <div
          style={{ display: 'flex', gap: '10px' }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDeleteCancel}
            sx={{
              borderRadius: 2,
              py: 1.2,
              width: '50%',
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={HandleDeleteAccount}
            sx={{
              backgroundColor: "#ed4242",
              color: "#fff",
              borderRadius: 2,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              width: '50%',
              "&:hover": {
                backgroundColor: "#ed4242",
              },
            }}
          >
            Delete
          </Button>
        </div>
      </Dialog>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleEndBox}>
          <div>
            <p
              style={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: "20px",
                paddingBottom: "8px",
              }}
            >
              {endReleseCust == "releseCustomer"
                ? "Exit Customer"
                : "End Session"}
            </p>
          </div>
          <div>
            <p style={{ textAlign: "center" }}>
              {endReleseCust == "releseCustomer"
                ? "Confirm exit? Customer will be removed from list."
                : "Do you want to end this customer’s session? Customer stays in available in list."}
            </p>
          </div>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            className="action-buttons"
            style={{ display: "flex", gap: "5px", margin: "15px 0px 0px 0px" }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setOpen(false);
              }}
              style={{ width: "50%", margin: "0px", fontSize: "12px" }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              style={{
                width: "50%",
                margin: "0px",
                fontSize: "12px",
                padding: "0px",
                backgroundColor: "#932e99",
                color: "white",
                border: "none",
              }}
              onClick={() => {
                if (endReleseCust === "releseCustomer") {
                  handleExitCustomer(endCustomnerInfo, false);
                } else {
                  handleExitCustomer(endCustomnerInfo, true);
                }
              }}
            >
              {endReleseCust == "releseCustomer"
                ? "Yes, Exit Customer"
                : "Yes, End Session"}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <div className="Header_main" ref={headerRef}>
        <div className="header-container">
          <div style={{ width: "33%" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => setOpenMenu(true)}
              variant="contained"
              style={{ backgroundColor: "transparent", color: "white" }}
            >
              <AlignJustify />
            </Button>
          </div>
          <div
            style={{
              width: "33.33%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img src={logo} style={{ maxWidth: "70px" }} />
          </div>
          <div
            style={{
              display: "flex",
              gap: "3px",
              width: "33.33%",
              justifyContent: "flex-end",
              paddingRight: "7px",
            }}
          >
            <Button
              className="AddCustomer_Btn"
              onClick={handleNaviagte}
              variant="contained"
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          top: "55px",
          zIndex: zIndexValue,
          padding: "7px",
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <p
          style={{
            fontSize: "17px",
            color: "#783eb5",
            fontWeight: 600,
            margin: "0px",
          }}
        >
          Customer List
        </p>
        <Button
          className="AddCustomer_refresh_Btn"
          onClick={GetCustomerData}
          variant="contained"
        >
          <RotateCcw />
        </Button>
      </div>

      {!loading &&
        (filteredData?.length !== 0 ? (
          <div className="CustomerContainer">
            <div className="CustomerList">
              {sortedData?.map((cust, i) => {
                const isExpanded = expandedCustomerId === cust.CustomerId;
                return (
                  <div
                    key={i}
                    className="customercard_button"
                    ref={(el) => (cardRefs.current[cust.CustomerId] = el)}
                    onClick={(e) => {
                      // navigate(`/JobScanPage`);
                      const button = e.currentTarget;
                      const circle = document.createElement("span");
                      const diameter = Math.max(
                        button.clientWidth,
                        button.clientHeight
                      );
                      const radius = diameter / 2;

                      circle.style.width =
                        circle.style.height = `${diameter}px`;
                      circle.style.left = `${e.clientX - button.offsetLeft - radius
                        }px`;
                      circle.style.top = `${e.clientY - button.offsetTop - radius
                        }px`;
                      circle.classList.add("ripple");

                      // Remove old ripple if exists
                      const ripple = button.getElementsByClassName("ripple")[0];
                      if (ripple) {
                        ripple.remove();
                      }

                      button.appendChild(circle);

                      if (cust.IsLockTimer === 0 || cust.IsLockTimer === 2) {
                        toggleExpand(cust.CustomerId);
                      } else {
                        handleClickStatus(cust);
                      }
                    }}
                    style={{
                      backgroundColor: cust.IsLockTimer === 2 && "#e4f0df",
                    }}
                  >
                    <div className="card-header">
                      <div>
                        <h5>{`${cust.firstname} ${cust.lastname}`}</h5>
                        <p className="text-muted">{cust.contactNumber}</p>
                      </div>

                      <div className="status-badge-container">
                        {cust.IsLockTimer === 0 && (
                          <div className="status-row">
                            <span className="dot available" />
                          </div>
                        )}

                        {cust.IsLockTimer === 1 && (
                          <span className="status-badge in-session">
                            <AiOutlineLock style={{ marginRight: "5px" }} />
                            In Session
                          </span>
                        )}

                        {cust.IsLockTimer === 2 && (
                          <div
                            className="status-row"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            <span
                              className="expand-icon"
                              onClick={() => handleClickStatus(cust)}
                              style={{
                                padding: "4px",
                                borderRadius: "3px",
                                width: "30px",
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <AiOutlineRight color="black" />
                            </span>
                            <span className="timer-text">
                              <AiOutlineClockCircle />
                              {formatSecondsToTime(
                                timers[cust.CustomerId] ?? 0
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      ref={(el) =>
                        (expandedSectionRefs.current[cust.CustomerId] = el)
                      }
                      className={`expand-wrapper ${isExpanded ? "show" : ""}`}
                    >
                      {cust.IsLockTimer === 0 && (
                        <div className="expand-actions">
                          <Button
                            size="small"
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStop(cust);
                              setEndReleseCust("releseCustomer");
                            }}
                            style={{
                              color: "white",
                              backgroundColor: "#811bdb",
                            }}
                          >
                            Remove From List
                          </Button>

                          <Button
                            size="small"
                            type="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickStatus(cust);
                            }}
                            style={{
                              color: "white",
                              backgroundColor: "#811bdb",
                            }}
                          >
                            Start Session
                          </Button>
                        </div>
                      )}

                      {cust.IsLockTimer === 2 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          {!stopped[cust.CustomerId] && (
                            <Button
                              size="small"
                              danger
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStop(cust);
                                setEndReleseCust("endCustomer");
                              }}
                              style={{
                                color: "white",
                                backgroundColor: "#811bdb",
                              }}
                            >
                              Exit Customer
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h6 class="MuiTypography-root MuiTypography-h6 css-32t4mj-MuiTypography-root">
              No Customer Available{" "}
            </h6>
          </div>
        ))}
    </div>
  );
};

export default Customer;