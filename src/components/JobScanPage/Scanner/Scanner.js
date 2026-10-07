import React, { useCallback, useEffect, useRef, useState } from "react";
import { QrReader } from "react-qr-reader";
import "./Scanner.scss";
import {
  Box,
  Button,
  Stack,
  Modal,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowDown,
  ArrowUp,
  CircleX,
  IndianRupee,
  Keyboard,
  Menu,
  Printer,
  ScanLine,
  Share2,
} from "lucide-react";
import { showToast } from "../../../Utils/Tostify/ToastManager";
import { Heart } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { GoInfo } from "react-icons/go";
import { Percent } from "lucide-react";
import { CallApi } from "../../../API/CallApi/CallApi";
import DiscountModal from "./DiscountModal";
import PlaceHolderImg from "../../../assests/placeHolderImg.svg";
import {
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import Webcam from "react-webcam";
import LoadingBackdrop from "../../../Utils/LoadingBackdrop";
import html2pdf from "html2pdf.js";
import PritnModel from "./PritnModel/PritnModel";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { AiOutlineDelete } from "react-icons/ai";
import { BrowserMultiFormatReader } from "@zxing/library";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: 2,
  borderRadius: '5px'
};

const Scanner = () => {
  const [scannedData, setScannedData] = useState([]);
  const [mode, setMode] = useState("qr");
  const [manualInput, setManualInput] = useState("");
  const [activeDetail, setActiveDetail] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountProductData, setDiscoutProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [printInfo, setPrintInfo] = useState();
  const activeCustomer = JSON.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const evoSettingRaw = sessionStorage.getItem("EvoSetting");
  const EvoSetting = evoSettingRaw ? JSON.parse(evoSettingRaw) : [];
  const printRef = useRef(null);
  const [zoomCap, setZoomCap] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const webcamRef = useRef(null);
  const trackRef = useRef(null);
  const detectorRef = useRef(null);
  const lastScannedRef = useRef("");
  const lastScanTimeRef = useRef(0);

  const [priceBreackUpAllValues, setPriceBreackUpAllValues] = useState();
  const [openPriceBraeckUp, setOpenPriceBraeckUp] = useState(false);
  const [removeJobNo, setRemoveJobNo] = useState("");
  const [opencnfDialogOpen, setOpenCnfDialog] = useState(false);
  const handleCloseDialog = () => setOpenCnfDialog(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [triggerPrint, setTriggerPrint] = useState(false);
  const pageAccessData = JSON.parse(
    sessionStorage.getItem("pageAccessData") || "[]"
  );

  const hasAccess = (pageId) =>
    pageAccessData.some(
      (p) => p.id === pageId && Number(p.isVisiable) === 1
    );

  const handleUserMedia = useCallback((stream) => {
    setCameraReady(true);
    try {
      const track = stream.getVideoTracks()[0];
      trackRef.current = track; // ← YOU WERE MISSING THIS
      const capabilities = track.getCapabilities?.();
      if (capabilities?.zoom) {
        setZoomCap(capabilities.zoom); // store the full cap object, not just true
      }
    } catch (error) {
      console.warn("Zoom not available");
      setZoomCap(null);
    }
  }, []);

  useEffect(() => {
    const savedScans = localStorage.getItem("AllScanJobData");
    if (savedScans) {
      try {
        const parsed = JSON.parse(savedScans);
        if (Array.isArray(parsed)) {
          setScannedData(parsed);
          if (parsed.length > 0) {
            setActiveDetail(parsed[0]);
          }
        } else {
          console.error(
            "Invalid data found in sessionStorage for AllScanJobData:",
            parsed
          );
          setScannedData([]);
        }
      } catch (e) {
        console.error("Error parsing AllScanJobData from sessionStorage:", e);
        setScannedData([]);
      }
    }
  }, []);


  const addScan = useCallback(
    async (jobNumber) => {
      const list = JSON.parse(localStorage.getItem("AllScanJobData"));
      if (list?.some((item) => item?.JobNo === jobNumber)) {
        setError(`Job ${jobNumber} already scanned`);
        showToast({
          message: `Job ${jobNumber} already scanned`,
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 2500,
          icon: "info"
        });
        setIsLoading(false);
        return false;
      }

      try {
        const Device_Token = sessionStorage.getItem("device_token");
        const body = {
          Mode: "GetScanJobData",
          Token: Device_Token,
          ReqData: JSON.stringify([
            {
              ForEvt: "GetScanJobData",
              DeviceToken: Device_Token,
              AppId: 3,
              JobNo: jobNumber,
              CustomerId: activeCustomer?.CustomerId,
              IsVisitor: 0,
            },
          ]),
        };
        const response = await CallApi(body);
        const jobData = response?.DT[0];
        setIsLoading(false);
        if (!jobData) {
          showToast({
            message: `Invalid job number: ${jobNumber}`,
            bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
            duration: 2500,
            icon: "warr"
          });
          return false;
        }

        const formatted = {
          JobNo: jobData.JobNo,
          designNo: jobData.DesignNo,
          price: jobData.Amount?.toFixed(0),
          metal: jobData.TotalMetalCost?.toFixed(0),
          diamoond: jobData.TotalDiamondCost,
          colorStone: jobData.TotalColorstoneCost,
          MetalWithlossWt: jobData?.MetalWithlossWt?.toFixed(3),
          MetalWithlossCost: jobData.MetalWithlossCost?.toFixed(0),
          makingCharge: jobData.TotalMakingCost,
          priceBreakupMakingCharge: jobData.TotalMakingCost + jobData?.TotalOtherCost + jobData?.TotalDiamondhandlingCost + jobData?.TotalSettingCost,
          taxAmount: jobData.TotalTaxAmount?.toFixed(0),
          netWeight: jobData.NetWt?.toFixed(3),
          GrossWeight: jobData.GrossWt?.toFixed(3),
          CartListId: jobData.CartListId,
          WishListId: jobData.WishListId,
          Category: jobData?.Category,
          TotalMetalCost: jobData?.TotalMetalCost?.toFixed(0),
          TotalSolCost: jobData?.TotalSolCost?.toFixed(0),
          TotalDiamondCost: jobData?.TotalDiamondCost?.toFixed(0),
          IsRateZero: jobData?.IsRateZero,
          TotalColorstoneCost: jobData?.TotalColorstoneCost?.toFixed(0),
          TotalMiscCost: jobData?.TotalMiscCost?.toFixed(0),
          TotalLabourAmount: jobData?.TotalOtherCost?.toFixed(0),
          TotalMakingCost: (
            jobData?.TotalMakingCost +
            jobData?.TotalDiamondhandlingCost +
            jobData?.TotalOtherCost
          )?.toFixed(0),
          DiamondWtP:
            jobData?.DiaWt > 0 || jobData?.DiaPcs > 0
              ? `${jobData.DiaWt > 0 ? jobData.DiaWt?.toFixed(3) : ""}${jobData.DiaWt > 0 && jobData.DiaPcs > 0 ? " / " : ""
              }${jobData.DiaPcs > 0 ? jobData.DiaPcs + "pcs" : ""}`
              : null,
          colorStoneWtP:
            jobData?.CsWt > 0 || jobData?.CsPcs > 0
              ? `${jobData?.CsWt > 0 ? jobData.CsWt?.toFixed(3) : ""}${jobData?.CsWt > 0 && jobData?.CsPcs > 0 ? " / " : ""
              }${jobData?.CsPcs > 0 ? jobData.CsPcs + "pcs" : ""}`
              : null,
          MiscWtP:
            jobData?.MiscWt > 0 || jobData?.MiscPcs > 0
              ? `${jobData?.MiscWt > 0 ? jobData.MiscWt?.toFixed(3) : ""}${jobData?.MiscWt > 0 && jobData?.MiscPcs > 0 ? " / " : ""
              }${jobData?.MiscPcs > 0 ? jobData.MiscPcs + "pcs" : ""}`
              : null,
          MetalTypeTitle: `${jobData?.MetalPurity +
            " " +
            jobData?.MetalTypeName +
            " " +
            jobData?.MetalColorName
            }`,
          status: "Scanned",
          image: `${jobData.CDNDesignImageFol}${jobData.ImageName}`, // "1/281165"
          isInCartList: jobData.IsInCartList, // NEW
          isInWishList: jobData.IsInWishList, // NEW
        };

        setScannedData((prevScannedData) => {
          const currentScans = Array.isArray(prevScannedData)
            ? prevScannedData
            : [];
          const newUpdatedData = [
            formatted,
            ...currentScans.filter((j) => j.JobNo !== formatted.JobNo),
          ];
          localStorage.setItem(
            "AllScanJobData",
            JSON.stringify(newUpdatedData)
          );
          return newUpdatedData;
        });

        setActiveDetail(formatted);
        setIsExpanded(true);
        setError(null);
        showToast({
          message: `Job No. ${jobNumber} scanned successfully`,
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 2500,
          icon: "success"
        });
      } catch (err) {
        setIsLoading(false);
        showToast({
          message: `Error scanning job: ${jobNumber}`,
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 2500,
          icon: "warr"
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [activeCustomer]
  );

  useEffect(() => {
    if (!cameraReady || mode !== "qr" || !webcamRef.current) return;

    const videoElem = webcamRef.current.video;
    if (!videoElem) return;

    const reader = new BrowserMultiFormatReader();
    detectorRef.current = reader;

    reader.decodeFromVideoDevice(null, videoElem, (result, err) => {
      if (result) {
        const text = result.getText().trim();
        const now = Date.now();
        if (
          text &&
          (text !== lastScannedRef.current ||
            now - lastScanTimeRef.current > 3000)
        ) {
          lastScannedRef.current = text;
          lastScanTimeRef.current = now;
          addScan(text);
        }
      }
    });

    return () => {
      if (detectorRef.current) {
        detectorRef.current.reset();
        detectorRef.current = null;
      }
    };
  }, [cameraReady, mode, addScan]);

  const toggleWishlist = async (detailItem, data) => {
    const Device_Token = sessionStorage.getItem("device_token");
    const current = data ? detailItem : activeDetail;
    try {
      if (!current) return;
      if (current.isInWishList) {
        const body = {
          Mode: "RemoveFromWishList",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "RemoveFromWishList",
              DeviceToken: Device_Token,
              JobNo: current.JobNo,
              AppId: 3,
              CartWishId: current.WishListId || 0,
              IsRemoveAll: 0,
              CustomerId: activeCustomer?.CustomerId || 0,
              IsVisitor: activeCustomer?.IsVisitor || 0,
            },
          ]),
        };

        await CallApi(body);
        showToast({
          message: "Removed from Wishlist",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 2000,
          icon: "remove"
        });

        const updated = {
          ...current,
          isInWishList: 0,
        };
        updateScannedAndSession(updated);
      } else {
        const body = {
          Mode: "AddToWishList",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "AddToWishList",
              DeviceToken: Device_Token,
              AppId: 3,
              JobNo: current.JobNo,
              CustomerId: activeCustomer?.CustomerId || 0,
              IsWishList: 1,
              IsVisitor: activeCustomer?.IsVisitor || 0,
              DiscountOnId:
                current?.criteriaDiscount?.IsCriteriabasedAmount == 1 ?
                  1
                  :
                  current?.discountType == "flat" ||
                    current?.discountType == "direct"
                    ? 1
                    : 0,
              Discount: current?.discountValue ?? 0,
            },
          ]),
        };

        const response = await CallApi(body);
        const insertedId = response?.DT?.[0]?.CartWishId || 0;

        showToast({
          message: "Added to Wishlist",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 2000,
          icon: "success"
        });

        const updated = {
          ...current,
          isInWishList: 1,
          CartWishId: insertedId,
        };
        updateScannedAndSession(updated);
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
      showToast({
        message: "Something went wrong. Try again.",
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
        fontColor: "white",
        duration: 4000,
        icon: "warr"
      });
    }
  };

  const toggleCart = async (detailItem, data) => {
    const Device_Token = sessionStorage.getItem("device_token");
    const current = data ? detailItem : activeDetail;
    try {
      if (!current) return;
      if (current.isInCartList) {
        const body = {
          Mode: "RemoveFromCart",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "RemoveFromCart",
              DeviceToken: Device_Token,
              AppId: 3,
              CartWishId: current.CartListId,
              JobNo: current.JobNo,
              IsRemoveAll: 0,
              CustomerId: activeCustomer.CustomerId || 0,
              IsVisitor: activeCustomer.IsVisitor || 0,
            },
          ]),
        };
        await CallApi(body);
        showToast({
          message: "Removed from Cart",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 4000,
          icon: "remove"
        });

        const updated = {
          ...current,
          isInCartList: 0,
        };
        updateScannedAndSession(updated);
      } else {
        const criteria = current?.criteriaDiscount || {};

        const body = {
          Mode: "AddToCart",
          Token: `"${Device_Token}"`,
          ReqData: JSON.stringify([
            {
              ForEvt: "AddToCart",
              DeviceToken: Device_Token,
              AppId: 3,
              JobNo: current.JobNo,
              CustomerId: activeCustomer.CustomerId || 0,
              IsVisitor: activeCustomer.IsVisitor || 0,
              DiscountOnId:
                current?.criteriaDiscount?.IsCriteriabasedAmount == 1 ?
                  1
                  :
                  current?.discountType == "flat" ||
                    current?.discountType == "direct"
                    ? 1
                    : 0,
              Discount: current?.discountValue
                ? Number(current.discountValue)
                : 0,
              IsCriteriabasedAmount:
                criteria?.IsCriteriabasedAmount || 0,

              IsDiamondAmount:
                criteria?.IsDiamondAmount || 0,

              IsDiamondDiscInAmount:
                criteria?.IsDiamondDiscInAmount || 0,

              DiamondDiscount:
                criteria?.DiamondDiscount || 0,

              IsStoneAmount:
                criteria?.IsStoneAmount || 0,

              IsStoneDiscInAmount:
                criteria?.IsStoneDiscInAmount || 0,

              StoneDiscount:
                criteria?.StoneDiscount || 0,

              IsMetalAmount:
                criteria?.IsMetalAmount || 0,

              IsMetalDiscInAmount:
                criteria?.IsMetalDiscInAmount || 0,

              MetalDiscount:
                criteria?.MetalDiscount || 0,

              IsLabourAmount:
                criteria?.IsLabourAmount || 0,

              IsLabourDiscInAmount:
                criteria?.IsLabourDiscInAmount || 0,

              LabourDiscount:
                criteria?.LabourDiscount || 0,

              IsSolitaireAmount:
                criteria?.IsSolitaireAmount || 0,

              IsSolitaireDiscInAmount:
                criteria?.IsSolitaireDiscInAmount || 0,

              SolitaireDiscount:
                criteria?.SolitaireDiscount || 0,

              IsMiscAmount:
                criteria?.IsMiscAmount || 0,

              IsMiscDiscInAmount:
                criteria?.IsMiscDiscInAmount || 0,

              MiscDiscount:
                criteria?.MiscDiscount || 0,
            },
          ]),
        };

        const response = await CallApi(body);
        const insertedId = response?.DT?.[0]?.CartWishId || 0;

        showToast({
          message: "Added to Cart",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 4000,
          icon: "success"
        });

        const updated = {
          ...current,
          isInCartList: 1,
          CartWishId: insertedId,
        };

        updateScannedAndSession(updated);
      }

    } catch (error) {
      console.error("Cart toggle failed:", error);
      showToast({
        message: "Something went wrong. Try again.",
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
        fontColor: "white",
        duration: 4000,
        icon: "warr"
      });
    }
  };

  const updateScannedAndSession = (updatedItem) => {
    const updatedList = scannedData.map((item) =>
      item.JobNo === updatedItem.JobNo ? updatedItem : item
    );
    setScannedData(updatedList);
    setActiveDetail(updatedItem);
    localStorage.setItem("AllScanJobData", JSON.stringify(updatedList));
  };

  const handleManualSave = () => {
    if (manualInput.trim()) {
      setIsLoading(true);
      addScan(manualInput.trim());
      setManualInput("");
    }
  };

  const handleConfirmRemoveAll = () => {
    const list = JSON.parse(localStorage.getItem("AllScanJobData") || "[]");
    const updatedList = list.filter((item) => item.JobNo !== removeJobNo);
    localStorage.setItem("AllScanJobData", JSON.stringify(updatedList));
    setScannedData(updatedList);
    if (removeJobNo === activeDetail?.JobNo) {
      setActiveDetail(null);
    }
    setOpenCnfDialog(false);
    return updatedList;
  };

  const handlePrint = () => {
    setIsLoading(true);
    const element = printRef.current;

    if (!element) {
      setIsLoading(false);
      return;
    }

    const allElements = element.querySelectorAll("*");
    allElements.forEach((el) => {
      el.style.color = "#000000";
      el.style.fontFamily = "Arial, Helvetica, sans-serif";
    });

    const elementHeight = element.scrollHeight;
    const elementWidth = element.scrollWidth;
    const widthMm = (elementWidth * 25.4) / 96;
    const heightMm = (elementHeight * 25.4) / 96;

    const opt = {
      margin: [2, 2, 2, 2],
      filename: "estimate.pdf",
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: elementWidth,
        windowWidth: elementWidth,
        backgroundColor: "#ffffff",
        imageTimeout: 0,
      },
      jsPDF: {
        unit: "mm",
        format: [widthMm + 4, heightMm + 4],
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("blob")
      .then((blob) => {
        const fileName = "estimate.pdf";
        if (window.flutter_inappwebview) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            window.flutter_inappwebview.callHandler("downloadPDF", base64data, fileName);
          };
          reader.readAsDataURL(blob);
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    if (triggerPrint && printInfo) {
      setTimeout(() => {
        handlePrint();
        setTriggerPrint(false);
      }, 600); // ← increase from 300 to 600ms
    }
  }, [triggerPrint, printInfo]);

  // const handlePrintfind = (data, allData) => {
  //   const savedScans = JSON.parse(localStorage.getItem("AllScanJobData"));
  //   const matchedArray = savedScans?.filter((item) => item.JobNo === data);
  //   const result = allData ? savedScans : matchedArray;
  //   setPrintInfo(result);
  //   setTriggerPrint(true);
  // };

  const handleShare = (data) => {
    setPrintInfo(data);
    const element = printRef.current;
    const elementHeight = element.scrollHeight;
    const elementWidth = element.scrollWidth;
    const widthMm = (elementWidth * 25.4) / 96;
    const heightMm = (elementHeight * 25.4) / 96;

    const opt = {
      margin: [2, 2, 2, 2],
      filename: "estimate.pdf",
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: elementWidth,
        windowWidth: elementWidth,
        backgroundColor: "#ffffff",
        imageTimeout: 0,
      },
      jsPDF: {
        unit: "mm",
        format: [widthMm + 4, heightMm + 4],
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("blob")
      .then((blob) => {
        const fileName = "estimate.pdf";
        if (window.flutter_inappwebview) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            window.flutter_inappwebview.callHandler(
              "sharePDF",
              base64data,
              fileName
            );
          };
          reader.readAsDataURL(blob);
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
  };

  const renderExpandedTop = () =>
    activeDetail && (
      <div
        className="top-detail-card_Big expanded"
        style={{
          marginBottom: "60px",
          backgroundColor: activeDetail?.IsRateZero == 1 && "rgb(255 214 214)",
        }}
      >
        <div style={{ padding: "5px" }}>
          <div className="header">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>
                {activeDetail.designNo} ({activeDetail?.JobNo})
              </span>
              <span>{activeDetail.Category}</span>
            </div>
            <div>
              {activeDetail?.discountValue != "" && <span
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  className={
                    activeDetail?.discountedPrice
                      ? "showData_price_deatil_withdiscount"
                      : "showData_price_deatil"
                  }
                >
                  <IndianRupee style={
                    { height: "21px", width: "12px" }
                  } />
                  {activeDetail.price}
                </span>
              </span>}


              <div>
                <p
                  className="showData_price_deatil"
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "3px",
                  }}
                >
                  {activeDetail?.discountedPrice > 0 ? (
                    <>
                      {activeDetail?.discountValue != "" && <span
                        style={{
                          fontSize: "12px",
                          color: "green",
                          display: "flex",
                          alignItems: "end",
                        }}
                      >
                        Save{" "}
                        {activeDetail?.discountType === "percentage"
                          ? `${activeDetail?.discountValue}%`
                          : `₹${activeDetail?.discountValue}`}
                      </span>}
                      <span style={{ width: '9px' }}>₹</span> {activeDetail.discountedPrice}
                    </>
                  ) : (
                    activeDetail?.discountedPrice !== "" &&
                    activeDetail?.discountedPrice !== undefined && <>₹ 0</>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <div style={{ width: "35%" }}>
              <img
                src={activeDetail?.image}
                onError={(e) => (e.target.src = PlaceHolderImg)}
                style={{ width: "90%", height: "100%", maxHeight: "130px" }}
              />
            </div>
            <div className="body" style={{ width: "65%" }}>
              {/* <div>
                <p className="showData_price_title">Actual Price</p>
                <p className="showData_price_deatil"> ₹{activeDetail.price}</p>
              </div> */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {activeDetail.GrossWeight && (
                    <div
                      style={{
                        width: "32%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        Gwt
                        <span style={{ fontSize: "10px" }}>(gm)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.GrossWeight}{" "}
                      </span>
                    </div>
                  )}

                  {activeDetail.netWeight && (
                    <div
                      style={{
                        width: "33%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        Net
                        <span style={{ fontSize: "10px" }}>(gm)</span>:
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.netWeight}{" "}
                      </span>
                    </div>
                  )}

                  {activeDetail.DiamondWtP && (
                    <div
                      style={{
                        width: "35%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        Dia.
                        <span style={{ fontSize: "10px" }}>(Ct)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.DiamondWtP}{" "}
                      </span>
                    </div>
                  )}

                  {activeDetail.colorStoneWtP && (
                    <div
                      style={{
                        width: "32%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        marginTop: activeDetail.DiamondWtP && "10px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        CS
                        <span style={{ fontSize: "10px" }}>(Ct)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.colorStoneWtP}
                      </span>
                    </div>
                  )}
                  {activeDetail.MiscWtP && (
                    <div
                      style={{
                        width: "33%",
                        display: "flex",
                        flexDirection: "column",
                        marginTop: activeDetail.DiamondWtP && "10px",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        Misc
                        <span style={{ fontSize: "10px" }}>(gm)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.MiscWtP}
                      </span>
                    </div>
                  )}

                  {activeDetail.MetalWithlossWt && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginTop: activeDetail.DiamondWtP && "10px",
                        gap: "2px",
                      }}
                    >
                      <p className="info_main_section">
                        {" "}
                        M+L
                        <span style={{ fontSize: "10px" }}>(gm)</span>:{" "}
                      </p>
                      <span className="info_main_section_span">
                        {activeDetail.MetalWithlossWt}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "10px",
            }}
          >
            {EvoSetting[0]?.IsPriceBreakUp == 1 && <Button
              className="scanner_List_moreview"
              onClick={() => {
                setOpenPriceBraeckUp(true);
                setPriceBreackUpAllValues(activeDetail);
              }}
              style={{
                backgroundColor:
                  activeDetail?.IsRateZero == 1
                    ? "transparent"
                    : "rgba(227, 228, 245, 0.4901960784)",
              }}
            >
              <GoInfo style={{ fontSize: "25px" }} />
            </Button>}

            {hasAccess(-1037) && (
              <Button
                className="scanner_List_moreview"
                onClick={() => toggleWishlist("", false)}
                style={{
                  backgroundColor:
                    activeDetail?.IsRateZero == 1
                      ? "transparent"
                      : "rgba(227, 228, 245, 0.4901960784)",
                }}
              >
                <Heart
                  fill={activeDetail.isInWishList ? "#ff3366" : "none"}
                  color={activeDetail.isInWishList ? "#ff3366" : "black"}
                  style={{ height: "20px", width: "20px" }}
                />
              </Button>
            )}
            {/* <IconButton onClick={() => toggleWishlist("", false)}>
              <ShoppingCart
                className={`btn ${
                  activeDetail.isInWishList ? "btn-active" : ""
                }`}
              />
            </IconButton> */}
            {hasAccess(-1038) && (
              <Button
                className="scanner_List_moreview"
                onClick={() => toggleCart("", false)}
                style={{
                  backgroundColor:
                    activeDetail?.IsRateZero == 1
                      ? "transparent"
                      : "rgba(227, 228, 245, 0.4901960784)",
                }}
              >
                <ShoppingCart
                  fill={activeDetail.isInCartList ? "#4caf50" : "none"}
                  color={activeDetail.isInCartList ? "#4caf50" : "black"}
                  style={{ height: "20px", width: "20px" }}
                />
              </Button>
            )}

            {/* <Button
              className="scanner_List_moreview"
              onClick={() => {
                handleShare(activeDetail);
              }}
              style={{ backgroundColor: 'transparent' }}
            >
              <Share2 style={{ height: "20px", width: "20px" }} />
            </Button> */}

            <Button
              className="scanner_List_moreview"
              onClick={() => {
                if (activeDetail.isInCartList) {
                  showToast({
                    message: "Discount not allowed on cart/wishlist items.",
                    bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
                    fontColor: "white",
                    duration: 4000,
                    icon: "info"
                  });
                } else if (activeDetail.isInWishList) {
                  showToast({
                    message: "Discount not allowed on cart/wishlist items.",
                    bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
                    fontColor: "white",
                    duration: 4000,
                    icon: "info"
                  });
                } else {
                  setDiscountModalOpen(true);
                  setDiscoutProductData(activeDetail);
                }
              }}
              style={{
                backgroundColor:
                  activeDetail?.IsRateZero == 1
                    ? "transparent"
                    : "rgba(227, 228, 245, 0.4901960784)",
              }}
            >
              <Percent
                fill={activeDetail.discountType ? "#4caf50" : "none"}
                color={activeDetail.discountType ? "#4caf50" : "black"}
                style={{ height: "20px", width: "20px" }}
              />
            </Button>

            <Button
              className="scanner_List_moreview"
              onClick={() => {
                setOpenCnfDialog(true);
                setRemoveJobNo(activeDetail?.JobNo);
              }}
              style={{
                backgroundColor:
                  activeDetail?.IsRateZero == 1
                    ? "transparent"
                    : "rgba(227, 228, 245, 0.4901960784)",
              }}
            >
              <AiOutlineDelete style={{ fontSize: "22px" }} />
            </Button>

            {/* <Button
              className="scanner_List_moreview"
              onClick={() => {
                handlePrintfind(activeDetail?.JobNo, false);
              }}
            >
              <Printer style={{ height: "20px", width: "20px" }} />
            </Button> */}
          </div>
        </div>
      </div>
    );

  useEffect(() => {
    let lastTime = 0;
    let frozenSince = null;
    const FREEZE_THRESHOLD = 2 * 60 * 1000;

    const checkInterval = setInterval(() => {
      const video = webcamRef.current?.video;
      if (video && video.readyState >= 2) {
        if (video.currentTime === lastTime) {
          if (!frozenSince) frozenSince = Date.now();
          if (Date.now() - frozenSince > FREEZE_THRESHOLD) {
            setIsFrozen(true);
          }
        } else {
          frozenSince = null;
          setIsFrozen(false);
        }
        lastTime = video.currentTime;
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, []);

  const handleRetry = () => {
    if (trackRef.current) {
      trackRef.current.stop();
      trackRef.current = null;
    }
    setIsFrozen(false);
    setCameraReady(false);
  };

  const [expandedItems, setExpandedItems] = useState([]);
  const handleZoomChange = (zoomValue) => {
    if (!cameraReady) return;
    if (zoomCap && trackRef.current) {
      const clampedZoom = Math.min(zoomCap.max, Math.max(zoomCap.min, zoomValue));
      trackRef.current
        .applyConstraints({ advanced: [{ zoom: clampedZoom }] })
        .then(() => setZoomLevel(clampedZoom))
        .catch((err) => console.error("Zoom error:", err));
    } else {
      setZoomLevel(zoomValue);
    }
  };
  const zoomOptions = [1, 2, 3, 4];

  const fmt = (v) => `₹ ${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const getDiscount = (enabled, isAmount, value, base) => {
    if (enabled !== 1 || !base) {
      return { amt: 0, pct: 0, display: "" };
    }

    // If discount entered in ₹
    if (isAmount === 1) {
      const amt = Number(value || 0);
      const pct = (amt / base) * 100;

      return {
        amt,
        pct,
        display: `${pct.toFixed(2)}%`,
      };
    }

    // If discount entered in %
    const pct = Number(value || 0);
    const amt = (base * pct) / 100;

    return {
      amt,
      pct,
      display: `${pct}%`,
    };
  };

  const buildRows = (d) => {
    const cd = d?.criteriaDiscount;
    const diamondOrig = Number(d?.TotalDiamondCost || 0);
    const stoneOrig = Number(d?.TotalColorstoneCost || 0);
    const miscOrig = Number(d?.TotalMiscCost || 0);
    const metalOrig = Number(d?.TotalMetalCost || 0);
    const makingOrig = Number(d?.priceBreakupMakingCharge || 0);
    const priceOrig = Number(d?.price || 0);

    const diamond = getDiscount(
      cd?.IsDiamondAmount,
      cd?.IsDiamondDiscInAmount,
      cd?.DiamondDiscount,
      diamondOrig
    );

    const stone = getDiscount(
      cd?.IsStoneAmount,
      cd?.IsStoneDiscInAmount,
      cd?.StoneDiscount,
      stoneOrig
    );

    const misc = getDiscount(
      cd?.IsMiscAmount,
      cd?.IsMiscDiscInAmount,
      cd?.MiscDiscount,
      miscOrig
    );

    const making = getDiscount(
      cd?.IsLabourAmount,
      cd?.IsLabourDiscInAmount,
      cd?.LabourDiscount,
      makingOrig
    );

    const metal = getDiscount(
      cd?.IsLabourAmount,
      cd?.IsLabourDiscInAmount,
      cd?.LabourDiscount,
      makingOrig
    );

    const rows = [
      {
        label: "Metal",
        original: metalOrig,
        discAmt: 0,
        discPct: "",
        isMetal: true,
      },
      {
        label: "Diamond",
        original: diamondOrig,
        discAmt: diamond.amt,
        discPct: diamond.display,
      },
      {
        label: "Color Stone",
        original: stoneOrig,
        discAmt: stone.amt,
        discPct: stone.display,
      },
      {
        label: "Misc",
        original: miscOrig,
        discAmt: misc.amt,
        discPct: misc.display,
      },
      {
        label: "Making Charges",
        original: makingOrig,
        discAmt: making.amt,
        discPct: making.display,
      },
    ];

    const totalOrig = priceOrig;

    const totalDisc = rows.reduce((sum, r) => sum + r.discAmt, 0);

    const hasRowDiscount = totalDisc > 0;

    // Metal / Diamond / Color Stone / Misc are the "core" breakup rows.
    // If all four of these are 0, the row-level breakup carries no useful
    // information, so callers should skip rendering it entirely and only
    // show the Tot Amt / Final Price summary.
    const coreLabels = ["Metal", "Diamond", "Color Stone", "Misc"];
    const coreRows = rows.filter((r) => coreLabels.includes(r.label));
    const showBreakupRows = coreRows.some((r) => Number(r.original) > 0);

    return { rows, totalOrig, totalDisc, hasRowDiscount, showBreakupRows };
  };

  const isJobMovedToBill = (jobNo) => {
    if (!jobNo) return false;
    const movedBillJobs = JSON.parse(localStorage.getItem("movedBillJob") || "[]");
    return movedBillJobs.includes(jobNo);
  };

  return (
    <div className="scanner-container">
      <LoadingBackdrop isLoading={isLoading} />
      <DiscountModal
        discountModalOpen={discountModalOpen}
        setDiscountModalOpen={setDiscountModalOpen}
        activeDetail={discountProductData}
        updateScannedAndSession={updateScannedAndSession}
        showToast={showToast}
      />
      <Modal
        open={openPriceBraeckUp}
        onClose={() => setOpenPriceBraeckUp(false)}
      >
        <Box sx={style}>
          <div className="drawer-content">

            <button
              onClick={() => setOpenPriceBraeckUp(false)}
              style={{
                border: "none",
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                cursor: "pointer",
              }}
            >
              <CircleX />
            </button>

            {/* Header */}
            <div style={{ display: "flex", gap: "6px", fontSize: "13px" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {priceBreackUpAllValues?.designNo}
              </p>
              <p style={{ margin: 0, color: "#666" }}>
                ({priceBreackUpAllValues?.JobNo})
              </p>
            </div>

            <p
              style={{
                margin: "6px 0 12px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Price Breakup
            </p>

            {(() => {
              const { rows, totalOrig, totalDisc, hasRowDiscount, showBreakupRows } =
                buildRows(priceBreackUpAllValues);

              const discountedPrice =
                priceBreackUpAllValues?.discountedPrice
                  ? Number(priceBreackUpAllValues.discountedPrice)
                  : totalOrig - totalDisc;

              const totalDiscDisplay =
                priceBreackUpAllValues?.discountValue
                  ? Number(priceBreackUpAllValues.discountValue)
                  : totalDisc;

              const totalPct = rows.reduce((sum, row) => {
                if (!row.discPct) return sum;

                const pct = parseFloat(row.discPct.replace("%", ""));
                return sum + pct;
              }, 0);

              const totalDiscPct = totalPct ? totalPct.toFixed(2) + "%" : "—";

              return (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  {showBreakupRows && (
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                        <th style={thStyle("left")}>Item</th>
                        {hasRowDiscount && <th style={thStyle("right")}>Price</th>}
                        {hasRowDiscount && <th style={thStyle("right")}>Disc</th>}
                        <th style={thStyle("right")}>
                          Final
                        </th>
                      </tr>
                    </thead>
                  )}

                  <tbody>
                    {showBreakupRows &&
                      rows.map((row, i) => {
                        const discounted = row.original - row.discAmt;
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={tdStyle("left")}>{row.label}</td>

                            {hasRowDiscount && (
                              <td style={tdStyle("right")}>
                                {fmt(row.original)}
                              </td>
                            )}

                            {hasRowDiscount && (
                              <td
                                style={{
                                  ...tdStyle("center"),
                                  color: row.discAmt > 0 ? "#e53935" : "#999",
                                }}
                              >
                                {row.discAmt > 0 ? row.discPct : "—"}
                              </td>
                            )}

                            <td style={{ ...tdStyle("right"), fontWeight: 600 }}>
                              {fmt(discounted)}
                            </td>
                          </tr>
                        );
                      })}

                    {/* Total Row */}
                    <tr
                      style={{
                        borderTop: "2px solid #bdbdbd",
                        background: "#fafafa",
                      }}
                    >
                      <td style={{ ...tdStyle("left"), fontWeight: 700 }}>
                        Tot Amt.
                      </td>

                      {showBreakupRows && hasRowDiscount && (
                        <td style={{ ...tdStyle("right"), fontWeight: 700, width: '100px' }}>
                          {fmt(totalOrig)}
                        </td>
                      )}

                      {showBreakupRows && hasRowDiscount && (
                        <td
                          style={{
                            ...tdStyle("right"),
                            fontWeight: 700,
                            color: "#e53935",
                          }}
                        >
                          {totalDiscPct}
                        </td>
                      )}

                      <td style={{ ...tdStyle("right"), fontWeight: 700, width: '100px' }}>
                        {fmt(totalOrig - totalDisc)}
                      </td>
                    </tr>

                    {/* Save Row */}
                    {(priceBreackUpAllValues?.discountValue || totalDisc > 0) && (
                      <tr style={{ background: "#f1fdf4" }}>
                        <td
                          colSpan={showBreakupRows && hasRowDiscount ? 3 : 1}
                          style={{
                            ...tdStyle("left"),
                            color: "#2e7d32",
                            fontWeight: 700,
                          }}
                        >
                          Save (Tot. Discount)
                        </td>

                        <td
                          style={{
                            ...tdStyle("right"),
                            color: "#2e7d32",
                            fontWeight: 700,
                          }}
                        >
                          {
                            priceBreackUpAllValues?.discountType == "percentage" ?
                              `${totalDiscDisplay}%` :
                              fmt(totalDiscDisplay)
                          }
                        </td>
                      </tr>
                    )}

                    {/* Final Price */}
                    <tr
                      style={{
                        borderTop: "2px solid #9e9e9e",
                        background: "#fff8e1",
                      }}
                    >
                      <td
                        colSpan={showBreakupRows && hasRowDiscount ? 3 : 1}
                        style={{
                          ...tdStyle("left"),
                          fontWeight: 800,
                          fontSize: "14px",
                        }}
                      >
                        Final Price
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#888",
                            marginLeft: 4,
                          }}
                        >
                          (Excl. Tax)
                        </span>
                      </td>

                      <td
                        style={{
                          ...tdStyle("right"),
                          fontWeight: 800,
                          fontSize: "14px",
                          color: "#1a237e",
                        }}
                      >
                        {fmt(discountedPrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()}
          </div>
        </Box>
      </Modal>

      <div
        style={{
          display: mode === "qr" ? "block" : "none",
          width: "100%",
        }}
      >
        <div className="camera-container">
          {isFrozen ? (
            <div
              style={{
                height: "250px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <p style={{ fontWeight: 600, margin: "5px" }}>
                Camera stopped working
              </p>
              <Button
                onClick={handleRetry}
                style={{
                  backgroundColor: "#a248dc",
                  color: "white",
                }}
              >
                Retry Camera
              </Button>
            </div>
          ) : (
            <div>
              <Webcam
                ref={webcamRef}
                mirrored={false}
                audio={false}
                playsInline
                muted
                screenshotFormat="image/jpeg"
                onUserMedia={handleUserMedia}
                onUserMediaError={(err) => {
                  console.error("Camera error", err);
                  setCameraReady(false);
                }}
                videoConstraints={{
                  facingMode: "environment",
                }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <div className="scan-box" />
              {cameraReady && (
                <div className="zoom-controls">
                  {zoomOptions.map((z) => (
                    <button
                      key={z}
                      className={`zoom-btn ${zoomLevel === z ? "active" : ""}`}
                      onClick={() => handleZoomChange(z)}
                    >
                      {z}X
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: mode === "manual" ? "block" : "none" }}>
        <div className="manual-input">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleManualSave();
              }
            }}
            placeholder="Enter job number"
          />
          <button onClick={handleManualSave}>Submit</button>
        </div>
      </div>

      {/* {activeDetail && mode != "AllScanItem" && renderExpandedTop()} */}
      {activeDetail && mode != "AllScanItem" && !isJobMovedToBill(activeDetail?.JobNo) && renderExpandedTop()}

      <div style={{ display: mode === "AllScanItem" ? "block" : "none" }}>
        {scannedData.length !== 0 ? (
          <div className={`expand-container ${isExpanded ? "expanded" : ""}`}>
            {scannedData.map((data, idx) => {
              const isExpanded = expandedItems.includes(idx);
              return (
                <div key={idx} className="recent-item">
                  <div
                    className="top-detail-card_Big"
                    style={{
                      border: "1px solid #ccc",
                      marginBottom: "10px",
                      boxShadow:
                        "rgba(0, 0, 0, 0.01) 0px 0px 3px 0px, rgba(27, 31, 35, 0.1) 0px 0px 0px 1px !important",
                      backgroundColor:
                        data?.IsRateZero == 1
                          ? "rgb(255 214 214)"
                          : "rgb(248 248 248 / 49%)",
                    }}
                  >
                    <div
                      className="summary-row"
                      onClick={() => {
                        setExpandedItems((prev) =>
                          prev.includes(idx)
                            ? prev.filter((i) => i !== idx)
                            : [...prev, idx]
                        );
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <h4 style={{ margin: "0px 2px" }}>
                              {data.designNo}({data?.JobNo})
                            </h4>

                            <p style={{ margin: "0px", fontSize: "13px" }}>
                              {data.Category}
                            </p>
                          </div>

                          <div>
                            {data?.discountValue != "" &&
                              <p
                                className={
                                  data?.discountedPrice
                                    ? "showData_price_deatil_withdiscount"
                                    : "showData_price_deatil"
                                }
                              >
                                <IndianRupee style={
                                  { height: "21px", width: "12px" }
                                } />
                                {data.price}
                              </p>
                            }

                            {data?.discountedPrice && (
                              <div>
                                <p
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "3px",
                                  }}
                                  className="showData_price_deatil"
                                >
                                  {data?.discountValue !== "" && (
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        color: "green",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "2px"
                                      }}
                                    >
                                      Save{" "}
                                      {data?.discountType === "percentage" ? (
                                        `${data?.discountValue}%`
                                      ) : (
                                        <>
                                          <span style={{ width: '8px' }}>
                                            <IndianRupee style={
                                              { height: "18px", width: "12px" }
                                            } />
                                          </span>
                                          <span>{data?.discountValue}</span>
                                        </>
                                      )}
                                    </span>
                                  )}
                                  <span style={{ display: 'flex' }}>
                                    <IndianRupee style={
                                      { height: "21px", width: "12px" }
                                    } />
                                    {data.discountedPrice}
                                  </span>
                                </p>
                              </div>
                            )}

                            <div
                              style={{
                                fontSize: "1.5rem",
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              {isExpanded ? (
                                <MdKeyboardDoubleArrowUp
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    borderRadius: "50px",
                                    color: "#b3b2b2",
                                  }}
                                />
                              ) : (
                                <MdKeyboardDoubleArrowDown
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    borderRadius: "50px",
                                    color: "#b3b2b2",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`expand-wrapper ${isExpanded ? "expanded" : ""
                        }`}
                    >
                      {isExpanded && (
                        <div
                          style={{
                            padding: "5px",
                            borderTop: "1px solid rgb(221 221 221 / 42%)",
                          }}
                        >
                          <div style={{ display: "flex", gap: "5px" }}>
                            <div style={{ width: "35%" }}>
                              <img
                                src={data?.image}
                                onError={(e) => (e.target.src = PlaceHolderImg)}
                                style={{
                                  width: "90%",
                                  height: "100%",
                                  maxHeight: "130px",
                                }}
                              />
                            </div>
                            <div className="body" style={{ width: "65%" }}>
                              <p
                                className="desc_metal_line"
                                style={{
                                  fontWeight: 600,
                                  margin: "0px 0px 5px 0px ",
                                }}
                              >
                                Metal : {data?.MetalTypeTitle}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "10px",
                                  minHeight: "70px",
                                }}
                              >
                                <div
                                  style={{ display: "flex", flexWrap: "wrap" }}
                                >
                                  {data?.GrossWeight !== null && (
                                    <div
                                      style={{
                                        width: "32%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                      }}
                                    >
                                      <p className="info_main_section">
                                        Gwt
                                        <span style={{ fontSize: "10px" }}>
                                          (gm)
                                        </span>
                                        :{" "}
                                      </p>
                                      <span className="info_main_section_span">
                                        {data.GrossWeight}{" "}
                                      </span>
                                    </div>
                                  )}
                                  {data?.netWeight !== null && (
                                    <div
                                      style={{
                                        width: "33%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                      }}
                                    >
                                      <p className="info_main_section">
                                        Net
                                        <span style={{ fontSize: "10px" }}>
                                          (gm)
                                        </span>
                                        :
                                      </p>
                                      <span className="info_main_section_span">
                                        {data.netWeight}{" "}
                                      </span>
                                    </div>
                                  )}

                                  {data.DiamondWtP && (
                                    <div
                                      style={{
                                        width: "35%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                      }}
                                    >
                                      <p className="info_main_section">
                                        Dia.
                                        <span style={{ fontSize: "10px" }}>
                                          (Ct)
                                        </span>
                                        :
                                      </p>
                                      <span className="info_main_section_span">
                                        {data.DiamondWtP}
                                      </span>
                                    </div>
                                  )}

                                  {data?.colorStoneWtP && (
                                    <div
                                      style={{
                                        width: "32%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                        marginTop: data.DiamondWtP && "5px",
                                      }}
                                    >
                                      <p className="info_main_section">
                                        CS
                                        <span style={{ fontSize: "10px" }}>
                                          (Ct)
                                        </span>
                                        :{" "}
                                      </p>
                                      <span className="info_main_section_span">
                                        {data.colorStoneWtP}
                                      </span>
                                    </div>
                                  )}
                                  {data?.MiscWtP && (
                                    <div
                                      style={{
                                        width: "33%",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                        marginTop: data.DiamondWtP && "5px",
                                      }}
                                    >
                                      <p className="info_main_section">
                                        Misc
                                        <span style={{ fontSize: "10px" }}>
                                          (gm)
                                        </span>
                                        :
                                      </p>
                                      <span className="info_main_section_span">
                                        {data.MiscWtP}
                                      </span>
                                    </div>
                                  )}

                                  {data.MetalWithlossWt && (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        marginTop: data.DiamondWtP && "5px",
                                        gap: "2px",
                                      }}
                                    >
                                      <p className="info_main_section">
                                        {" "}
                                        M+L
                                        <span style={{ fontSize: "10px" }}>
                                          (gm)
                                        </span>
                                        :{" "}
                                      </p>
                                      <span className="info_main_section_span">
                                        {data.MetalWithlossWt}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                              marginTop: "10px",
                            }}
                          >
                            {EvoSetting[0]?.IsPriceBreakUp == 1 && <Button
                              className="scanner_List_moreview"
                              onClick={() => {
                                setOpenPriceBraeckUp(true);
                                setPriceBreackUpAllValues(data);
                              }}
                              style={{
                                backgroundColor:
                                  data?.IsRateZero == 1
                                    ? "transparent"
                                    : "rgba(227, 228, 245, 0.4901960784)",
                              }}
                            >
                              <GoInfo style={{ fontSize: "22px" }} />
                            </Button>}

                            {hasAccess(-1037) && (
                              <Button
                                className="scanner_List_moreview"
                                onClick={() => toggleWishlist(data, true)}
                                style={{
                                  backgroundColor:
                                    data?.IsRateZero == 1
                                      ? "transparent"
                                      : "rgba(227, 228, 245, 0.4901960784)",
                                }}
                              >
                                <Heart
                                  fill={data.isInWishList ? "#ff3366" : "none"}
                                  color={data.isInWishList ? "#ff3366" : "black"}
                                  style={{ height: "20px", width: "20px" }}
                                />
                              </Button>
                            )}
                            {hasAccess(-1038) && (
                              <Button
                                className="scanner_List_moreview"
                                onClick={() => toggleCart(data, true)}
                                style={{
                                  backgroundColor:
                                    data?.IsRateZero == 1
                                      ? "transparent"
                                      : "rgba(227, 228, 245, 0.4901960784)",
                                }}
                              >
                                <ShoppingCart
                                  fill={data.isInCartList ? "#4caf50" : "none"}
                                  color={data.isInCartList ? "#4caf50" : "black"}
                                  style={{ height: "20px", width: "20px" }}
                                />
                              </Button>
                            )}
                            {/* <Button
                              className="scanner_List_moreview"
                              onClick={() => {
                                handleShare(data);
                              }}
                              style={{ backgroundColor: 'transparent' }}
                            >
                              <Share2 style={{ height: "20px", width: "20px" }} />
                            </Button> */}


                            <Button
                              className="scanner_List_moreview"
                              onClick={() => {
                                if (data.isInCartList) {
                                  showToast({
                                    message: "Discount not allowed on cart/wishlist items.",
                                    bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
                                    fontColor: "white",
                                    duration: 4000,
                                    icon: "info"
                                  });
                                } else if (data.isInWishList) {
                                  showToast({
                                    message: "Discount not allowed on cart/wishlist items.",
                                    bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
                                    fontColor: "white",
                                    duration: 4000,
                                    icon: "info"
                                  });
                                } else {
                                  setDiscountModalOpen(true);
                                  setDiscoutProductData(data);
                                }
                              }}
                              style={{
                                backgroundColor:
                                  data?.IsRateZero == 1
                                    ? "transparent"
                                    : "rgba(227, 228, 245, 0.4901960784)",
                              }}
                            >
                              <Percent
                                fill={data.discountType ? "#4caf50" : "none"}
                                color={data.discountType ? "#4caf50" : "black"}
                                style={{
                                  height:
                                    data?.IsRateZero == 1 ? "18px" : "15px",
                                  width:
                                    data?.IsRateZero == 1 ? "18px" : "15px",
                                }}
                              />
                            </Button>

                            <Button
                              className="scanner_List_moreview"
                              onClick={() => {
                                setOpenCnfDialog(true);
                                setRemoveJobNo(data?.JobNo);
                              }}
                              style={{
                                backgroundColor:
                                  data?.IsRateZero == 1
                                    ? "transparent"
                                    : "rgba(227, 228, 245, 0.4901960784)",
                              }}
                            >
                              <AiOutlineDelete style={{ fontSize: "22px" }} />
                            </Button>


                            {/* <Button
                              className="scanner_List_moreview"
                              onClick={() => handlePrintfind(data?.JobNo, false)}
                            >
                              <Printer style={{ height: "15px", width: "15px" }} />
                            </Button> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
            }}
          >
            <p>No Product Scanned</p>
          </div>
        )}
      </div>

      <Box className="JobScannerPage">
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          className="text-buttons"
        >
          <Button
            onClick={() => setMode("AllScanItem")}
            className={mode === "AllScanItem" ? "active" : ""}
            variant="text"
          >
            <Menu />
          </Button>
          <Button
            onClick={() => setMode("qr")}
            className={mode === "qr" ? "active" : ""}
            variant="text"
          >
            <ScanLine />
          </Button>
          <Button
            onClick={() => setMode("manual")}
            className={mode === "manual" ? "active" : ""}
            variant="text"
          >
            <Keyboard />
          </Button>
        </Stack>
      </Box>
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "80mm",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <div ref={printRef}>
          <PritnModel activeDetail={printInfo} />
        </div>
      </div>
      <ConfirmationDialog
        open={opencnfDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRemoveAll}
        title="Confirm"
        content="Are you sure you want to remove this item?"
      />
    </div>
  );
};

export default Scanner;


const thStyle = (align) => ({
  padding: "7px 8px",
  textAlign: align,
  fontWeight: 700,
  fontSize: "12px",
  color: "#555",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
});

const tdStyle = (align) => ({
  padding: "7px 8px",
  textAlign: align,
  fontSize: "13px",
  verticalAlign: "middle",
});