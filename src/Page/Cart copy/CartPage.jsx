import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Box, Stack, Button, Divider, Dialog, DialogContent, DialogActions } from '@mui/material';
import { Printer, ScrollText } from 'lucide-react';
import './CartPage.scss';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import { GetCartWishApi } from '../../API/Cart_WishlistAPI/GetCartlistApi';
import { RemoveFromCartWishApi } from '../../API/Cart_WishlistAPI/RemoveFromCartWishApi';
import LoadingBackdrop from '../../Utils/LoadingBackdrop';
import NoDataFound from '../../Utils/NoDataFound';
import { showToast } from '../../Utils/Tostify/ToastManager';
import { useNavigate } from 'react-router-dom';
import { moveToBillApi } from '../../API/Cart_WishlistAPI/MoveToBillApi';
import PritnModel from '../../components/JobScanPage/Scanner/PritnModel/PritnModel';
import html2pdf from 'html2pdf.js';
import PritnModelCart from './PritnModelCart/PritnModelCart';

const CartItemCard = lazy(() => import('../../components/CartComp/CartCard'));

const CartPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState();
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
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
        bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
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
       bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
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
  bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
        duration: 3000,
      });
    } else {
      showToast({
        message: "Failed to move to billing",
      bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
        duration: 3000,
      });
    }
  }

  const findleSingleDataPrint = () => {
    setOpenPrintModel(true);
  }

  const handlePrint = (data) => {
    const savedScans = data;
    const element = document.getElementById("printSection");
    // element.style.display = "block";
    const height = data
      ? savedScans?.length >= 2
        ? savedScans?.length >= 3
          ? savedScans?.length * 170
          : savedScans?.length * 190
        : 250
      : 300;

    const opt = {
      margin: [5, 5, 5, 5],
      filename: "estimate.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: [250, height],
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .outputPdf("blob")
      .then((blob, cx) => {
        const fileName = "estimate.pdf";
        // element.style.display = "none";
        if (window.flutter_inappwebview) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            window.flutter_inappwebview.callHandler(
              "downloadPDF",
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


  return (
    <Box className="CartMain">
      {isLoading || isLoading == null ? (
        <LoadingBackdrop isLoading={isLoading} />
      ) : cartItems?.length > 0 ? (
        <>
          <Dialog
            open={openPrintModel}
            onClick={() => setOpenPrintModel(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent dividers>
              <div
                id="printSection"
                className="printDesign"
                ref={printRef}
                style={{ width: "100%" }}

              >
                <PritnModelCart activeDetail={printInfo} />
              </div>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenPrintModel(false)} color="error">
                Cancel
              </Button>
              <Button
                onClick={() => handlePrint(printInfo)}
                style={{ backgroundColor: "#5e08b6", color: "white" }}
              >
                Download
              </Button>
            </DialogActions>
          </Dialog>

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
          </Suspense>
          <Box className="CartActionsFooter">
            <Stack direction="row" spacing={2} justifyContent="center" className="action-buttons">
              <Button variant="outlined" startIcon={<Printer size={18} />} onClick={() => { setPrintInfo(cartItems); setOpenPrintModel(true); }}>
                Print Estimate
              </Button>
              <Button variant="outlined" startIcon={<ScrollText size={18} />} onClick={handleMoveToBill}>
                Move to Billing
              </Button>
            </Stack>

            {/* <Divider className="footer-divider" />

            <Stack direction="row" spacing={2} justifyContent="center" className="text-buttons">
              <Button variant="text">Go to Customer</Button>
              <Button variant="text">Remark</Button>
            </Stack> */}
          </Box>
        </>
      ) : (
        <NoDataFound type="cart" />
      )}
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
