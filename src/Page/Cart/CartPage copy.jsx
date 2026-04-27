import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Box, Stack, Button, Divider, Dialog, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Printer, ScrollText, Share2 } from 'lucide-react';
import './CartPage.scss';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import { GetCartWishApi } from '../../API/Cart_WishlistAPI/GetCartlistApi';
import { RemoveFromCartWishApi } from '../../API/Cart_WishlistAPI/RemoveFromCartWishApi';
import LoadingBackdrop from '../../Utils/LoadingBackdrop';
import NoDataFound from '../../Utils/NoDataFound';
import { showToast } from '../../Utils/Tostify/ToastManager';
import { useNavigate } from 'react-router-dom';
import { moveToBillApi } from '../../API/Cart_WishlistAPI/MoveToBillApi';
import html2pdf from 'html2pdf.js';
import { ToWords } from 'to-words';
import { MoveToEstimateApi } from '../../API/Cart_WishlistAPI/MoveToEstimateApi';
import PritnModel from '../../components/JobScanPage/Scanner/PritnModel/PritnModel';

const CartItemCard = lazy(() => import('../../components/CartComp/CartCard'));

const CartPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState();
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
  const [opencnfDialogOpenEstiate, setOpenCnfDialogEstimate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [rmflag, setRmFlag] = useState("");
  const [openPrintModel, setOpenPrintModel] = useState(false);
  const printRef = useRef(null);
  const [printInfo, setPrintInfo] = useState();
  const handleOpenDialog = (cartItems, flag) => {
    setRmFlag(flag)
    setSelectedItems([cartItems]);
    setOpenCnfDialog(true);
  }
  const handleCloseDialog = () => {
    setOpenCnfDialog(false);
  }
  const [triggerPrint, setTriggerPrint] = useState(false);

  const hanldeRemoveFromCart = async () => {
    let allScanJobData = JSON?.parse(localStorage.getItem("AllScanJobData")) || [];
    setIsLoading(true);
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromCart", flag: rmflag, cartWishData: selectedItems[0] });
    if (res) {
      setCartItems(prevItems => prevItems.filter(item => !selectedItems.includes(item)));
      setSelectedItems([]);
      allScanJobData = allScanJobData?.map(item =>
        item.JobNo === selectedItems[0].JobNo ? { ...item, isInCartList: 0 } : item
      );
      localStorage.setItem("AllScanJobData", JSON.stringify(allScanJobData));
      showToast({
        message: "Item removed from cart",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 3000,
      });
    }
    setIsLoading(false);
    handleCloseDialog();
  }

  const handleRemoveAllFromCart = async () => {
    let allScanJobData = JSON?.parse(localStorage.getItem("AllScanJobData")) || [];
    setIsLoading(true);
    const res = await RemoveFromCartWishApi({ mode: "RemoveFromCart", flag: rmflag, cartWishData: cartItems[0], IsRemoveAll: 1 });
    if (res) {
      setCartItems([]);
      setSelectedItems([]);
      allScanJobData = allScanJobData?.map(item =>
        cartItems?.some(cartItem => cartItem.JobNo === item.JobNo) ? { ...item, isInCartList: 0 } : item
      );
      localStorage?.setItem("AllScanJobData", JSON?.stringify(allScanJobData));
      showToast({
        message: "Items removed from cart",
        bgColor: "#4caf50",
        fontColor: "#fff",
        duration: 3000,
      });
    }
    setIsLoading(false);
    handleCloseDialog();
  }

  const handleConfirmRemoveAll = () => {
    if (rmflag == "single") {
      hanldeRemoveFromCart();
    } else {
      handleRemoveAllFromCart();
    }
  }

  const getCartData = async () => {
    setIsLoading(true);
    const mode = "GetCartList";
    const res = await GetCartWishApi({ mode });
    if (res) {
      setCartItems(res?.DT);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getCartData();
  }, [])

  const handleMoveToBill = async () => {
    const res = await moveToBillApi();
    if (res?.DT[0]?.stat != 0) {
      let allScanJobData =
        JSON.parse(localStorage.getItem("AllScanJobData")) || [];
      const cartJobNos = cartItems.map(item => item.JobNo);
      allScanJobData = allScanJobData.map(item =>
        cartJobNos.includes(item.JobNo)
          ? { ...item, isInCartList: 0 }
          : item
      );
      localStorage.setItem(
        "AllScanJobData",
        JSON.stringify(allScanJobData)
      );
      navigate("/orderSuccess", { replace: true });
    } else if (res?.DT[0]?.stat_msg == "Job Already Move To Bill") {
      showToast({
        message: "Job Already Move To Bill",
        bgColor: "#f8d7da",
        fontColor: "#721c24",
        duration: 3000,
      });
    } else {
      showToast({
        message: "Failed to move to billing",
        bgColor: "#f8d7da",
        fontColor: "#721c24",
        duration: 3000,
      });
    }
  }

  const handleGeneretEstimate = async () => {
    sessionStorage.setItem('shareorprintData', JSON.stringify(cartItems));
    setIsLoading(true)
    const res = await MoveToEstimateApi(cartItems);
    setIsLoading(false);
    if (res?.DT[0]?.stat != 0) {
      navigate("/estimateSuccess", { replace: true });
    }
  }

  const findleSingleDataPrint = () => {
    setOpenPrintModel(true);
  }

  const handlePrintfind = () => {
    setPrintInfo(cartItems);
    setTriggerPrint(true);
  };

  const handleShare = () => {
    setPrintInfo(cartItems);
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
      image: { type: "jpeg", quality: 1.0 },    // ← max quality
      html2canvas: {
        scale: 4,                                 // ← higher scale = clearer text
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
      }, 600);
    }
  }, [triggerPrint, printInfo]);

  return (
    <Box className="CartMain">
      {isLoading || isLoading == null ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) : cartItems?.length > 0 ? (
        <>
          <Suspense fallback={<></>}>
            <Box className="CartHeaderClBtn">
              <Button variant="text" onClick={() => handleOpenDialog({}, "all")}>
                Clear All
              </Button>
            </Box>
            <Box className="CartItemList">
              {cartItems?.map(item => (
                <CartItemCard
                  key={item.id}
                  cartItem={item}
                  handleOpenDialog={handleOpenDialog}
                  setOpenPrintModel={setOpenPrintModel}
                  setPrintInfo={setPrintInfo}
                  findleSingleDataPrint={findleSingleDataPrint}
                  cartItems={cartItems}
                />
              ))}
            </Box>
            <IconButton onClick={
              handleShare}
              style={{
                position: "fixed",
                bottom: "70px",
                right: "20px",
                backgroundColor: '#8507a9',
                color: '#fff',
              }}>
              <Share2 className="btn" />
            </IconButton>

            <IconButton onClick={handlePrintfind}
              style={{
                position: "fixed",
                bottom: "120px",
                right: "20px",
                backgroundColor: '#8507a9',
                color: '#fff',
              }}>
              <Printer className="btn" />
            </IconButton>
          </Suspense>
          <Box className="CartActionsFooter">
            <Stack direction="row" spacing={1} justifyContent="center" className="action-buttons">
              <Button variant="outlined" startIcon={<Printer size={18} />}
                onClick={() => { setPrintInfo(cartItems); setOpenCnfDialogEstimate(true) }}>
                Generate Estimates
              </Button>
              <Button variant="outlined" startIcon={<ScrollText size={18} />} onClick={handleMoveToBill}>
                Move to Billing
              </Button>
            </Stack>
          </Box>
        </>
      ) : (
        <NoDataFound type="cart" />
      )}

      <ConfirmationDialog
        open={opencnfDialogOpenEstiate}
        onClose={() => setOpenCnfDialogEstimate(false)}
        onConfirm={handleGeneretEstimate}
        title="Confirm"
        content="Are you sure you want to Generate Estimates?"
        confirmLabel="Yes"
        cancelLabel="No"
      />

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
    </Box>
  );
};

export default CartPage;