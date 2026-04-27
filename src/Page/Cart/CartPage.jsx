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
import { MoveToEstimateApi } from '../../API/Cart_WishlistAPI/MoveToEstimateApi';

const CartItemCard = lazy(() => import('../../components/CartComp/CartCard'));

const CartPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState();
  const [opencnfDialogOpen, setOpenCnfDialog] = React.useState(false);
  const [opencnfDialogOpenEstiate, setOpenCnfDialogEstimate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [rmflag, setRmFlag] = useState("");

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

  const handleGeneretEstimate = async () => {
    sessionStorage.setItem('shareorprintData', JSON.stringify(cartItems));
    setIsLoading(true)
    const res = await MoveToEstimateApi(cartItems);
    setIsLoading(false);
    if (res?.DT[0]?.stat != 0) {
      navigate("/estimateSuccess", { replace: true });
    }
  }


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
                  cartItem={item}
                  handleOpenDialog={handleOpenDialog}
                />
              ))}
            </Box>
          </Suspense>
          <Box className="CartActionsFooter">
            <Stack direction="row" spacing={1} justifyContent="center" className="action-buttons">
              <Button variant="outlined" startIcon={<Printer size={18} />}
                onClick={() => setOpenCnfDialogEstimate(true)}>
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