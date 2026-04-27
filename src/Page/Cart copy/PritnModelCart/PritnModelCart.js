import React from "react";
import "./PritnModelCart.scss";
import { ToWords } from "to-words";
import { Box } from "@mui/material";

const PritnModelCart = ({ activeDetail }) => {
  const curruntActiveCustomer = JSON?.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paise",
          plural: "Paise",
        },
      },
    },
  });

  const userInfo = JSON.parse(sessionStorage.getItem("profileData"));
  const today = new Date();
  const formattedDate = today
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toLowerCase();

  const totals = (activeDetail || []).reduce(
    (acc, item) => {
      acc.totalTaxAmount += Number(item.TotalTaxAmount) || 0;
      acc.totalPrice += Number(item.Amount) || 0;
      acc.allTotalDiscount += Number(item.DiscountAmount) || 0;
      return acc;
    },
    {
      totalTaxAmount: 0,
      totalPrice: 0,
      allTotalDiscount: 0,
    }
  );
  totals.finalAmount =
    totals.totalTaxAmount + totals.totalPrice - totals?.allTotalDiscount;

    log
  return (
    <Box className="printModelMain_cart" flex={1}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p className="P_toptitle">{userInfo?.CompanyFullName}</p>
        <p className="p_address">
          {userInfo?.CompanyAddress} {userInfo?.CompanyAddress2}{" "}
        </p>
        <p className="p_city">
          {userInfo?.CompanyCity}-{userInfo?.CompanyPinCode}
        </p>
        <p className="p_gst">{userInfo?.CompanyTellNo}</p>
        <p className="p_gst">{userInfo?.GSTNo}</p>
        <p className="p_estimate">Estimate</p>
      </div>
      <div className="info_section_main">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0px 5px",
          }}
        >
          <div style={{ display: "flex", gap: "2px" }}>
            <p className="p_info_title">Customer name : </p>
            <p className="p_info_value">
              {curruntActiveCustomer?.firstname}{" "}
              {curruntActiveCustomer?.lastname}
            </p>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <p className="p_info_title">Date : </p>
            <p className="p_info_value">{formattedDate}</p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            padding: "0px 5px",
            gap: "2px",
          }}
        >
          <p className="p_info_title">Phone number : </p>
          <p className="p_info_value">{curruntActiveCustomer?.contactNumber}</p>
        </div>
      </div>

      {activeDetail?.map((dataa, index) => {
        return (
          <div
            key={index}
            style={{
              borderBottom: "1px dotted black",
              padding: "5px 2px 5px 5px",
              marginTop: "5px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p className="deatilTitle_p">Sr# : {index + 1}</p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <p className="deatil_title_view">Job# : </p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.JobNo}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "2px",
                }}
              >
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Category</p>
                  <p className="deatilTitle_com">:</p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.Category}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <p className="deatil_title_view">Design# : </p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.DesignNo}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0px",
                }}
              >
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Net wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">{dataa?.NetWt.toFixed(3)}</p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalMetalCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Dia wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.DiaWt?.toFixed(3)} / {dataa?.DiaPcs}s
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalDiamondCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">CS wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.CsWt?.toFixed(3)} / {dataa?.CsPcs}s
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">
                    ₹ {dataa?.TotalColorstoneCost}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Misc wt </p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.MiscWt?.toFixed(3)} / {dataa?.MiscPcs}s
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalMiscCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Making</p>
                  <p className="deatilTitle_com">:</p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalMakingCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Gross wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.GrossWt?.toFixed(3)} gm
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">
                    ₹ {dataa?.Amount?.toFixed(0)}
                  </p>
                </div>
              </div>

              {dataa?.DiscountAmount !== 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <p className="deatilTitle_p">Discount</p>
                    <p
                      className="deatil_totla_p"
                      style={{
                        minWidth: "36px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      ₹ {dataa?.DiscountAmount}
                    </p>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Amount</p>
                  <p
                    className="deatil_totla_p"
                    style={{
                      minWidth: "35px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <b>
                      ₹{" "}
                      {dataa?.DiscountAmount
                        ? (dataa?.Amount - dataa?.DiscountAmount)?.toFixed(0)
                        : dataa?.Amount?.toFixed(0)}
                    </b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Total Discount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.allTotalDiscount?.toFixed(0)}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Total Amount</b>
            </p>
            <p className="totalPriceValus">
              <b>
                ₹ {(totals.totalPrice - totals.allTotalDiscount)?.toFixed(0)}
              </b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Tax Amount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.totalTaxAmount?.toFixed(0)}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Final Amount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.finalAmount?.toFixed(0)}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px", width: "15%" }}>
              <b>In Word :</b>
            </p>
            <p
              style={{
                margin: "2px",
                minWidth: "100px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "8px",
                width: "85%",
              }}
            >
              <b>{toWords.convert(Number(totals.finalAmount)?.toFixed(0))}</b>
            </p>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default PritnModelCart;
