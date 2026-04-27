import { CallApi } from "../../../API/CallApi/CallApi";
import {
  Modal,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import { CircleX, IndianRupee, Percent } from "lucide-react";
import { useEffect, useState } from "react";

const DiscountModal = ({
  discountModalOpen,
  setDiscountModalOpen,
  activeDetail,
  updateScannedAndSession,
  showToast,
}) => {
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [directPriceInput, setDirectPriceInput] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(
    activeDetail?.price || 0
  );

  const [discountMode, setDiscountMode] = useState("total");
  const [criteriaDiscounts, setCriteriaDiscounts] = useState({
    metal: { value: "", type: "amount" },
    diamond: { value: "", type: "amount" },
    stone: { value: "", type: "amount" },
    labour: { value: "", type: "amount" },
    Solitaire: { value: "", type: "amount" },
    Misc: { value: "", type: "amount" },
  });

  const criteriaList = [
    // { key: "metal", label: "Metal Amount" },
    { key: "diamond", label: "Diamond Amount" },
    { key: "stone", label: "ColorStone Amount" },
    { key: "labour", label: "Labour Amount" },
    { key: "Solitaire", label: "Solitaire Amount" },
    { key: "Misc", label: "Misc Amount" },
  ];

  const [visibleCriteria, setVisibleCriteria] = useState({
    diamond: false,
    stone: false,
    metal: false,
    labour: false,
    Solitaire: false,
    Misc: false,
  });

  const originalPrice = activeDetail?.price || 0;
  const profileData = JSON.parse(sessionStorage.getItem("profileData"));

  useEffect(() => {
    if (!discountModalOpen || !activeDetail) return;

    const {
      discountType: adType,
      discountValue: adValue,
      discountedPrice: adPrice,
      criteriaDiscount,
    } = activeDetail ?? {};

    setDiscountMode(adType === "criteria" ? "criteria" : "total");

    if (adType === "criteria" && criteriaDiscount) {
      // Prefill criteriaDiscounts state from saved criteriaDiscount
      const map = {
        Diamond: "diamond",
        Stone: "stone",
        Metal: "metal",
        Labour: "labour",
        Solitaire: "Solitaire",
        Misc: "Misc",
      };

      const prefill = {};
      Object.entries(map)?.forEach(([apiKey, stateKey]) => {
        const value = criteriaDiscount[`${apiKey}Discount`] || 0;
        const isAmount = criteriaDiscount[`Is${apiKey}DiscInAmount`] === 1;
        prefill[stateKey] = {
          value: value,
          type: isAmount ? "amount" : "percentage",
        };
      });

      setCriteriaDiscounts(prefill);
      setCalculatedPrice(Number(adPrice) || originalPrice);
      setDiscountValue(Number(adValue) || 0);
      setDirectPriceInput("");
      setDiscountType("flat"); // criteria mode ignores this field
      return;
    }

    // Total / direct discount prefill
    setDiscountType(adType === undefined ? "flat" : adType);
    setDiscountValue(Number(adValue ?? 0));
    setDirectPriceInput(adType === "direct" ? String(adPrice ?? "") : "");
    setCalculatedPrice(adPrice ?? originalPrice);

  }, [discountModalOpen, activeDetail?.JobNo]);


  useEffect(() => {
    if (!activeDetail) return;
    setVisibleCriteria({
      diamond: Number(activeDetail.TotalDiamondCost) > 0,
      stone: Number(activeDetail.TotalColorstoneCost) > 0,
      metal: Number(activeDetail.TotalMetalCost) > 0,
      labour: Number(activeDetail.TotalMakingCost) > 0,
      Solitaire: Number(activeDetail.TotalSolCost) > 0,
      Misc: Number(activeDetail.TotalMiscCost) > 0,
    });
  }, [activeDetail?.JobNo]);

  useEffect(() => {
    if (directPriceInput !== "") {
      const directPrice = Number(directPriceInput);
      const diff = originalPrice - directPrice;
      if (diff > 0) {
        setDiscountValue(diff);
        setCalculatedPrice(directPrice.toFixed(0));
      } else {
        setDiscountValue(0);
        setCalculatedPrice(originalPrice);
      }
    } else {
      const discount = Number(discountValue);
      let finalPrice = originalPrice;
      if (discountType === "flat") {
        finalPrice = originalPrice - discount;
      } else if (discountType === "percentage") {
        finalPrice = originalPrice - (originalPrice * discount) / 100;
      }
      const safeFinalPrice = Number(finalPrice) || 0;

      setCalculatedPrice(
        safeFinalPrice > 0
          ? safeFinalPrice.toFixed(0)
          : 0
      );
    }
  }, [discountValue, discountType, originalPrice, directPriceInput]);


  const handleSaveOnly = async () => {
    const limitPercent = Number(profileData?.Discount ?? 0);
    const originalPrice = Number(activeDetail?.price || 0);

    let appliedDiscount = 0;
    let criteriaPayload = {};
    const getCriteriaBaseAmount = (field) => {
      switch (field) {
        case "Diamond":
          return Number(activeDetail?.TotalDiamondCost || 0);

        case "Stone":
          return Number(activeDetail?.TotalColorstoneCost || 0);

        case "Metal":
          return Number(activeDetail?.TotalMetalCost || 0);

        case "Labour":
          return Number(activeDetail?.TotalMakingCost || 0);

        case "Misc":
          return Number(activeDetail?.TotalMiscCost || 0);

        default:
          return 0;
      }
    };
    if (discountMode === "criteria") {
      const map = {
        diamond: "Diamond",
        stone: "Stone",
        metal: "Metal",
        labour: "Labour",
        Misc: "Misc",
      };

      let exceeded = false;
      criteriaPayload = {
        IsCriteriabasedAmount: 1,
      };

      Object.entries(map).forEach(([key, apiKey]) => {
        const visible = visibleCriteria[key];
        const value = Number(criteriaDiscounts[key]?.value || 0);
        const type = criteriaDiscounts[key]?.type;

        const baseAmount = getCriteriaBaseAmount(apiKey);
        let maxAllowed = 0;
        if (type === "amount") {
          maxAllowed = (baseAmount * limitPercent) / 100;
          if (value > maxAllowed) exceeded = true;
        }

        if (type === "percentage") {
          if (value > limitPercent) exceeded = true;
        }

        criteriaPayload[`Is${apiKey}Amount`] = visible ? 1 : 0;

        criteriaPayload[`Is${apiKey}DiscInAmount`] =
          visible && value > 0 && type === "amount" ? 1 : 0;

        criteriaPayload[`${apiKey}Discount`] =
          visible && value > 0 ? value : 0;
      });

      if (exceeded) {
        showToast({
          message: `Discount limit  ${limitPercent}% reached`,
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 5000,
        });
        return;
      }

      // ---------- Calculate Final Discount (SQL Matching Logic) ----------
      appliedDiscount = 0;

      Object.entries(map).forEach(([key, apiKey]) => {
        const isActive = criteriaPayload[`Is${apiKey}Amount`] === 1;
        const isAmount =
          criteriaPayload[`Is${apiKey}DiscInAmount`] === 1;
        const discountValue = Number(
          criteriaPayload[`${apiKey}Discount`] || 0
        );

        if (!isActive || discountValue <= 0) return;

        const baseAmount = getCriteriaBaseAmount(apiKey);

        let componentDiscount = 0;

        if (isAmount) {
          // Flat discount
          componentDiscount = discountValue;
        } else {
          // Percentage discount
          componentDiscount =
            (baseAmount * discountValue) / 100;
        }

        appliedDiscount += componentDiscount;
      });

      if (appliedDiscount <= 0) {
        showToast({
          message: "Discount removed",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 5000,
        });

        updateScannedAndSession({
          ...activeDetail,
          discountValue: "",
          discountType: "",
          discountedPrice: originalPrice,
          criteriaDiscount: null,
        });

        setDiscountModalOpen(false);
        return;
      }
    }
    else {
      if (directPriceInput !== "") {
        const directPrice = Number(directPriceInput);
        appliedDiscount = originalPrice - directPrice;

        if (
          appliedDiscount >
          (originalPrice * limitPercent) / 100
        ) {
          showToast({
            message: `Discount limit  ${limitPercent}% reached`,
            bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
            duration: 5000,
          });
          return;
        }
      }

      else if (discountType === "flat") {
        appliedDiscount = Number(discountValue);
        if (
          appliedDiscount >
          (originalPrice * limitPercent) / 100
        ) {
          showToast({
            message: `Discount limit  ${limitPercent}% reached`,
            bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
            duration: 5000,
          });
          return;
        }
      }

      else if (discountType === "percentage") {
        const percent = Number(discountValue);

        if (percent > limitPercent) {
          showToast({
            message: `Discount limit  ${limitPercent}% reached`,
            bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
            fontColor: "white",
            duration: 5000,
          });
          return;
        }

        appliedDiscount =
          (originalPrice * percent) / 100;
      }
      if (appliedDiscount <= 0) {
        showToast({
          message: "Discount removed",
          bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
          fontColor: "white",
          duration: 5000,
        });

        updateScannedAndSession({
          ...activeDetail,
          discountValue: "",
          discountType: "",
          discountedPrice: originalPrice,
          criteriaDiscount: null,
        });

        setDiscountModalOpen(false);
        return;
      }
    }

    try {
      const activeCust = JSON.parse(
        sessionStorage.getItem("curruntActiveCustomer")
      );

      const Device_Token =
        sessionStorage.getItem("device_token");

      const body = {
        Mode: "SaveDiscount",
        Token: Device_Token,
        ReqData: JSON.stringify([
          {
            ForEvt: "SaveDiscount",
            DeviceToken: Device_Token,
            AppId: 3,
            JobNo: activeDetail?.JobNo,
            CustomerId: activeCust?.CustomerId,
            IsVisitor: 0,
            IsCriteriabasedAmount:
              discountMode === "criteria" ? 1 : 0,
            ...criteriaPayload,
            DiscountOnId:
              discountMode === "total" &&
                discountType === "flat"
                ? 1
                : 0,
            Discount:
              discountMode === "criteria" ? "0" :
                discountMode === "total"
                  ? discountValue
                  : appliedDiscount.toFixed(0),
          },
        ]),
      };

      await CallApi(body);
    } catch (err) {
      console.warn("Discount Save Error:", err);
    }
    updateScannedAndSession({
      ...activeDetail,
      discountValue:
        discountMode === "criteria"
          ? appliedDiscount.toFixed(0)
          : Number(discountValue),
      criteriaDiscount:
        discountMode === "criteria"
          ? criteriaPayload
          : null,
      discountType:
        discountMode === "criteria"
          ? "criteria"
          : discountType,
      discountedPrice:
        (originalPrice - appliedDiscount).toFixed(0),
    });

    showToast({
      message: "Discount applied successfully.",
      bgColor: "linear-gradient(to right, #b2069b, #3909c2)",
      fontColor: "white",
      duration: 5000,
    });

    setDiscountModalOpen(false);
  };

  const maxDirectPrice = Math.max(originalPrice - 1, 0);
  const handleDirectPriceInput = (e) => {
    setDiscountType("flat");
    const cleaned = e.target.value.replace(/[^\d]/g, "");
    if (cleaned === "") {
      setDirectPriceInput("");
      setDiscountValue("");
      return;
    }
    let num = Number(cleaned);
    if (num > maxDirectPrice) num = maxDirectPrice;
    setDirectPriceInput(String(num));
    setDiscountValue("");
  };

  const handleDiscountChange = (e) => {
    let val = e.target.value;
    if (!/^\d*\.?\d*$/.test(val)) return;
    if (val === "") {
      setDiscountValue("");
      return;
    }
    if (val.startsWith(".")) {
      val = "0" + val;
    }
    if (discountType === "percentage") {
      const num = parseFloat(val);
      if (!Number.isNaN(num) && num > 100) {
        val = "100";
      }
    } else {
      const num = parseFloat(val);
      const maxFlatDiscount = Math.max(originalPrice - 1, 0);
      if (!Number.isNaN(num) && num > maxFlatDiscount) {
        val = String(maxFlatDiscount);
      }
    }
    setDiscountValue(val);
  };

  const handleClearDirect = () => {
    setDirectPriceInput("");
    setDiscountValue("");
    setCalculatedPrice(originalPrice);
  };

  const handleClearDiscount = () => {
    setDiscountValue("");
    setDirectPriceInput("");
    setCalculatedPrice(originalPrice);
  };

  return (
    <Modal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          outline: "none",
          p: 3,
          minHeight: 550
        }}
      >
        <div
          style={{ position: "absolute", right: "10px", top: "10px" }}
          onClick={() => setDiscountModalOpen(false)}
        >
          <CircleX style={{ color: "#5e08b6" }} />
        </div>

        <Typography variant="h6" gutterBottom>
          Apply Discount
        </Typography>
        <Typography variant="body2">
          <strong>Job No:</strong> {activeDetail?.JobNo}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Original Price:</strong> ₹{originalPrice}
        </Typography>

        <ToggleButtonGroup
          value={discountMode}
          exclusive
          onChange={(e, val) => {
            if (val) {
              setDiscountMode(val);
              setDiscountType('flat');
            }
          }}
          fullWidth
          sx={{ my: 2 }}
        >
          <ToggleButton value="total" style={{ fontSize: '11px' }}>
            Total Amount
          </ToggleButton>
          <ToggleButton value="criteria" style={{ fontSize: '11px' }}>
            Criteria Based
          </ToggleButton>
        </ToggleButtonGroup>


        {discountMode === "total" && (
          <>
            <TextField
              label="Enter Final Price Directly (₹)"
              type="text"
              fullWidth
              value={directPriceInput}
              onChange={handleDirectPriceInput}
              onKeyDown={(e) => {
                if (
                  [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ].includes(e.key)
                )
                  return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                max: maxDirectPrice,
              }}
              InputProps={{
                endAdornment:
                  directPriceInput !== "" ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearDirect}>
                        <CircleX size={20} style={{ color: "#5e08b6" }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
              }}
              sx={{ mb: 2, color: "red" }}
            />

            <ToggleButtonGroup
              value={discountType}
              exclusive
              onChange={(e, newVal) => {
                if (newVal && directPriceInput === "") {
                  setDiscountType(newVal);
                }
                setDiscountValue("");
              }}
              fullWidth
              disabled={directPriceInput !== ""}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="flat" style={{ fontSize: "11px" }}>
                Amount(
                <IndianRupee style={{ height: "13px", width: "13px" }} />)
              </ToggleButton>
              <ToggleButton value="percentage" style={{ fontSize: "11px" }}>
                Percentage(
                <Percent style={{ height: "15px", width: "13px" }} />)
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label={discountType === "flat" ? "Discount (₹)" : "Discount (%)"}
              type="text"
              fullWidth
              readOnly={directPriceInput !== ""}
              value={discountValue === "" ? "" : discountValue}
              onChange={handleDiscountChange}
              inputProps={{
                inputMode: "decimal", // allows decimal point keypad
              }}
              InputProps={{
                endAdornment:
                  discountValue !== "" ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearDiscount}>
                        <CircleX size={20} style={{ color: "#5e08b6" }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Total After Discount"
              value={`₹${calculatedPrice}`}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </>
        )}

        {discountMode === "criteria" && (
          <Stack spacing={2}>
            {criteriaList.map((item) => {
              if (!visibleCriteria[item.key]) return null;
              const data = criteriaDiscounts[item.key];
              return (
                <Box
                  key={item.key}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <TextField
                    label={item.label}
                    value={data.value}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.]/g, "");
                      setCriteriaDiscounts((prev) => ({
                        ...prev,
                        [item.key]: { ...prev[item.key], value: val },
                      }));
                    }}
                    fullWidth
                    inputProps={{ inputMode: "decimal" }}
                    sx={{
                      height: "40px",

                      "& .MuiInputBase-root": {
                        height: "40px",
                        minHeight: "40px",
                      },

                      "& .MuiInputBase-input": {
                        padding: "0 8px",
                        height: "40px",
                        boxSizing: "border-box",
                        fontSize: "12px",
                      },

                      "& .MuiFormLabel-root": {
                        fontSize: "12px",
                        top: "50%",
                        transform: "translate(14px, -50%) scale(1)",
                        transition: "all 0.2s ease",
                      },

                      "& .MuiFormLabel-root.Mui-focused, & .MuiFormLabel-root.MuiFormLabel-filled": {
                        top: 0,
                        transform: "translate(14px, -6px) scale(0.75)",
                      },
                    }}
                  />

                  <TextField
                    select
                    value={data.type}
                    onChange={(e) => {
                      setCriteriaDiscounts((prev) => ({
                        ...prev,
                        [item.key]: {
                          ...prev[item.key],
                          type: e.target.value,
                        },
                      }));
                    }}
                    sx={{
                      width: 65,
                      height: "40px",
                      "& .MuiInputBase-root": {
                        height: "40px",
                        minHeight: "40px",
                      },
                      "& .MuiInputBase-input": {
                        padding: "0 8px",
                        boxSizing: "border-box",
                        fontSize: "13px",
                      },
                    }}
                  >
                    <MenuItem value="amount">₹</MenuItem>
                    <MenuItem value="percentage">%</MenuItem>
                  </TextField>
                </Box>
              );
            })}
          </Stack>
        )}
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            style={{
              backgroundColor: "rgb(149 51 250)",
              color: "white",
            }}
            onClick={handleSaveOnly}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default DiscountModal;