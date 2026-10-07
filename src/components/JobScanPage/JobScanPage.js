import React, { useState, useEffect, useRef } from "react";
import "./JobScanPage.scss";
import { Box, Typography, IconButton, Stack, Button } from "@mui/material";
import {
  ChevronLeft,
  FileSpreadsheet,
  Heart,
  House,
  QrCode,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CartPage from "../../Page/Cart/CartPage";
import WishlistPage from "../../Page/Wishlist/WishlistPage";
import Scanner from "./Scanner/Scanner";
import NotePage from "../../Page/Note/NotePage";

const JobScanPage = () => {
  const [activeTab, setActiveTab] = useState(null); // null until access is resolved
  const [tabsFixed, setTabsFixed] = useState(false);
  const headerRef = useRef(null);
  const curruntActiveCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const pageAccessData = JSON.parse(
    sessionStorage.getItem("pageAccessData") || "[]"
  );

  const hasAccess = (pageId) =>
    pageAccessData.some(
      (p) => p.id === pageId && Number(p.isVisiable) === 1
    );
  const navigate = useNavigate();

  // Decide the default tab on mount, in priority order: scan -> wishlist -> cart -> note
  useEffect(() => {
    if (hasAccess(-1034)) {
      setActiveTab("scan");
    } else if (hasAccess(-1037)) {
      setActiveTab("wishlist");
    } else if (hasAccess(-1038)) {
      setActiveTab("cart");
    } else if (hasAccess(-1039)) {
      setActiveTab("note");
    } else {
      setActiveTab("noAccess");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setTabsFixed(headerBottom <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "scan":
        return (
          <div className="tab-content">
            <Scanner />
          </div>
        );
      case "wishlist":
        return (
          <div className="tab-content">
            <WishlistPage />
          </div>
        );
      case "cart":
        return (
          <div className="tab-content">
            <CartPage />
          </div>
        );
      case "note":
        return (
          <div className="tab-content">
            <NotePage />
          </div>
        );
      case "noAccess":
        return (
          <div className="tab-content">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="300px"
            >
              <Typography variant="h6" color="text.secondary">
                You don't have access to any section on this page.
              </Typography>
            </Box>
          </div>
        );
      default:
        return null; // still resolving access, render nothing (or a loader if you want)
    }
  };

  return (
    <div className="JobScanPageMain">
      <Box className="CartHeader_main" ref={headerRef}>
        <Stack className="header-container">
          <div>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "white",
                margin: "0px",
              }}
            >
              {curruntActiveCustomer?.firstname}{" "}
              {curruntActiveCustomer?.lastname}
            </p>
            <p
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                color: "white",
                margin: "0px",
              }}
            >
              {curruntActiveCustomer?.CompanyName}
            </p>
          </div>
          <Box textAlign="right" style={{ width: "33.33%" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/")}
              variant="contained"
            >
              <House />
            </Button>
          </Box>
        </Stack>
      </Box>

      {activeTab !== "noAccess" && (
        <div className={`top-tabs ${tabsFixed ? "fixed" : ""}`}>
          {hasAccess(-1034) && (
            <div
              className={`tab-item ${activeTab === "scan" ? "active" : ""}`}
              onClick={() => setActiveTab("scan")}
            >
              <QrCode size={20} />
              <span>Scan Job</span>
            </div>
          )}

          {hasAccess(-1037) && (
            <div
              className={`tab-item ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              <Heart size={20} />
              <span>Wishlist</span>
            </div>
          )}

          {hasAccess(-1038) && (
            <div
              className={`tab-item ${activeTab === "cart" ? "active" : ""}`}
              onClick={() => setActiveTab("cart")}
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
            </div>
          )}

          {hasAccess(-1039) && (
            <div
              className={`tab-item ${activeTab === "note" ? "active" : ""}`}
              onClick={() => setActiveTab("note")}
            >
              <FileSpreadsheet size={20} />
              <span>Note</span>
            </div>
          )}
        </div>
      )}

      <div className={`tab-body ${tabsFixed ? "stop" : ""}`}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default JobScanPage;