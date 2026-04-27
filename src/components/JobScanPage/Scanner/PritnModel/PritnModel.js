import "./PritnModel.css";
import { ToWords } from "to-words";

const PritnModel = ({ activeDetail: rawDetail }) => {
  const activeDetail = Array.isArray(rawDetail) ? rawDetail : rawDetail ? [rawDetail] : [];
  const curruntActiveCustomer = JSON?.parse(
    sessionStorage.getItem("curruntActiveCustomer")
  );
  const EvoSetting = JSON.parse(
    sessionStorage.getItem("EvoSetting")
  );
  const userInfo = JSON.parse(sessionStorage.getItem("profileData"));
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
        fractionalUnit: { name: "Paise", plural: "Paise" },
      },
    },
  });

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
    { totalTaxAmount: 0, totalPrice: 0, allTotalDiscount: 0 }
  );

  totals.finalAmount =
    totals.totalTaxAmount + totals.totalPrice - totals.allTotalDiscount;

  const criteriaTotals = (activeDetail || []).reduce(
    (acc, item) => {
      const pct = (base, disc) => (Number(base || 0) * (Number(disc) || 0)) / 100;

      if (item.IsMetalAmount)
        acc.Metal += item.IsMetalDiscInAmount === 1
          ? Number(item.MetalDiscount) || 0
          : pct(item.TotalMetalCost, item.MetalDiscount);

      if (item.IsDiamondAmount)
        acc.Diamond += item.IsDiamondDiscInAmount === 1
          ? Number(item.DiamondDiscount) || 0
          : pct(item.TotalDiamondCost, item.DiamondDiscount);

      if (item.IsStoneAmount)
        acc.Stone += item.IsStoneDiscInAmount === 1
          ? Number(item.StoneDiscount) || 0
          : pct(item.TotalColorstoneCost, item.StoneDiscount);

      if (item.IsMiscAmount)
        acc.Misc += item.IsMiscDiscInAmount === 1
          ? Number(item.MiscDiscount) || 0
          : pct(item.TotalMiscCost, item.MiscDiscount);

      if (item.IsLabourAmount)
        acc.Labour += item.IsLabourDiscInAmount === 1
          ? Number(item.LabourDiscount) || 0
          : pct((item.TotalMakingCost + item?.TotalOtherCost), item.LabourDiscount);
      return acc;
    },
    { Diamond: 0, Stone: 0, Misc: 0, Labour: 0 }
  );

  const hasCriteriaDiscount = Object.values(criteriaTotals).some((v) => v > 0);

  const fmt = (val) =>
    Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="printModelMain">
      <div className="printView_screenMainDiv">
        <div style={{ textAlign: "center" }}>
          <p className="P_toptitle">{userInfo?.CompanyFullName}</p>
          <p className="p_address">
            {userInfo?.CompanyAddress} {userInfo?.CompanyAddress2}
          </p>
          <p className="p_city">
            {userInfo?.CompanyCity} - {userInfo?.CompanyPinCode}
          </p>
          {userInfo?.CompanyTellNo && (
            <p className="p_gst">Ph: {userInfo.CompanyTellNo}</p>
          )}
          {userInfo?.GSTNo && (
            <p className="p_gst">GST: {userInfo.GSTNo}</p>
          )}
        </div>

        <hr className="bill_divider" />
        <p className="p_estimate">Estimate</p>
        <hr className="bill_divider" />

        <div className="customer_block">
          <div className="info_row">
            <p className="p_info_title">Customer :</p>
            <p className="p_info_value">
              {curruntActiveCustomer?.firstname}{" "}
              {curruntActiveCustomer?.lastname}
            </p>
          </div>

          {curruntActiveCustomer?.contactNumber && (
            <div className="info_row">
              <p className="p_info_title">Phone :</p>
              <p className="p_info_value">
                {curruntActiveCustomer.contactNumber}
              </p>
            </div>
          )}

          <div className="info_row">
            <p className="p_info_title">Date :</p>
            <p className="p_info_value">{formattedDate}</p>
          </div>
        </div>

        <hr className="bill_divider" />

        <div className="col_header_row">
          <p className="col_header_desc">Description</p>
          <p className="col_header_amt">Amount</p>
        </div>

        <hr className="bill_divider" />

        {(activeDetail || []).map((dataa, index) => {
          const itemAmount = dataa?.Discount
            ? Number(dataa.Amount) - Number(dataa.Discount)
            : Number(dataa.Amount);

          const weightRows = [
            {
              label: "Net Wt",
              value: dataa?.NetWt ? `${dataa.NetWt?.toFixed(3)} gm` : "",
              cost: dataa?.TotalMetalCost,
            },
            {
              label: "Dia Wt",
              value:
                `${dataa.DiaWt > 0 ? dataa.DiaWt?.toFixed(3) : "0.000"}${dataa.DiaWt > 0 && dataa.DiaPcs > 0 ? " / " : ""
                }${dataa.DiaPcs > 0 ? dataa.DiaPcs + "pcs" : ""}`,
              cost: dataa?.TotalDiamondCost != 0 ? dataa?.TotalDiamondCost : '0.00',
            },
            {
              label: "CS Wt",
              value:
                `${dataa?.CsWt > 0 ? dataa.CsWt?.toFixed(3) : "0.000"}${dataa?.CsWt > 0 && dataa?.CsPcs > 0 ? " / " : ""
                }${dataa?.CsPcs > 0 ? dataa.CsPcs + "pcs" : ""}`,
              cost: dataa?.TotalColorstoneCost != 0 ? dataa?.TotalColorstoneCost : '0.00',
            },
            {
              label: "Misc Wt",
              value:
                `${dataa?.MiscWt > 0 ? dataa.MiscWt?.toFixed(3) : "0.000"}${dataa?.MiscWt > 0 && dataa?.MiscPcs > 0 ? " / " : ""
                }${dataa?.MiscPcs > 0 ? dataa.MiscPcs + "pcs" : ""}`,
              cost: dataa?.TotalMiscCost != 0 ? dataa?.TotalMiscCost : '0.00',
            },
            {
              label: "Making Charges", value: "", cost: dataa?.TotalMakingCost +
                dataa?.TotalDiamondhandlingCost +
                dataa?.TotalOtherCost
            },
            { label: "Gross Wt", value: dataa?.GrossWt ? `${dataa.GrossWt?.toFixed(3)} gm` : "" },
          ];

          return (
            <div key={index} className="productInfo_main">
              <div className="item_header_row">
                <p className="item_jobno">#{index + 1} — {dataa?.JobNo}</p>
                {dataa?.DesignNo && (
                  <p className="item_design">Design: {dataa.DesignNo}</p>
                )}
              </div>
              {dataa?.Category && (
                <p className="item_category">{dataa.Category}</p>
              )}

              {weightRows.map(
                ({ label, value, cost, bold }) =>
                  (value || cost) && (
                    <div key={label} className="detail_row">
                      <div className="detail_left">
                        <p className="deatilTitle_p">{label}</p>
                        <p className="deatilTitle_com">:</p>
                        {value ? (
                          <p className="deatil_value_p">{value}</p>
                        ) : null}
                      </div>
                      {EvoSetting?.[0]?.IsPriceBreakUp == 1 && cost && (
                        <p className="deatil_totla_p">
                          {bold ? <b>₹ {fmt(cost)}</b> : <>₹ {fmt(cost)}</>}
                        </p>
                      )}
                    </div>
                  )
              )}

              {/* {dataa?.Discount && (
                <div className="item_discount_row">
                  <p className="item_discount_label">Discount</p>
                  <p className="item_discount_val"> {dataa?.DiscountOnId == 1 && '₹'} {fmt(dataa.Discount)}{dataa?.DiscountOnId == 0 && '%'}</p>
                </div>
              )} */}

              {/* Item amount */}
              <div className="item_amount_row">
                <p className="item_amount_label">Amount</p>
                <p className="item_amount_val">₹ {fmt(itemAmount)}</p>
              </div>
            </div>
          );
        })}

        <div className="totals_block">
          {hasCriteriaDiscount &&
            [
              { label: "Metal Discount", value: criteriaTotals.Metal },
              { label: "Diamond Discount", value: criteriaTotals.Diamond },
              { label: "ColorStone Discount", value: criteriaTotals.Stone },
              { label: "Misc Discount", value: criteriaTotals.Misc },
              { label: "Labour Discount", value: criteriaTotals.Labour },
            ].map(
              ({ label, value }) =>
                value > 0 && (
                  <div key={label} className="total_row">
                    <p className="total_label">{label}</p>
                    <p className="totalPriceValus">- ₹ {fmt(value)}</p>
                  </div>
                )
            )}

          <div className="total_row">
            <p className="total_label">Total Discount</p>
            <p className="totalPriceValus">- ₹ {fmt(totals.allTotalDiscount)}</p>
          </div>

          <div className="total_row">
            <p className="total_label">Sub Total</p>
            <p className="totalPriceValus">
              ₹ {fmt(totals.totalPrice - totals.allTotalDiscount)}
            </p>
          </div>

          <div className="total_row">
            <p className="total_label">Tax Amount</p>
            <p className="totalPriceValus">₹ {fmt(totals.totalTaxAmount)}</p>
          </div>

          <div className="total_row_final">
            <p className="total_label" style={{ fontSize: "16px", fontWeight: 700 }}>
              FINAL AMOUNT
            </p>
            <p className="totalPriceValus" style={{ fontSize: "16px", fontWeight: 900 }}>
              ₹ {fmt(totals.finalAmount)}
            </p>
          </div>

          {/* In words */}
          <div className="inword_box">
            <p className="inword_label">In Words :</p>
            <p className="inword_text">
              {toWords.convert(Number(totals.finalAmount))}
            </p>
          </div>

          {/* Footer */}
          <div className="bill_footer">
            <p>Thank you for your visit!</p>
            {userInfo?.CompanyWebsite && <p>{userInfo.CompanyWebsite}</p>}
            {userInfo?.CompanyEmail && <p>{userInfo.CompanyEmail}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PritnModel;