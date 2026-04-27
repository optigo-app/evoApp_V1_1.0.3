import { CommonAPI } from "../CommonAPI/CommonAPI";



const mapCartItemsToProductData = (cartItems = []) => {
    return cartItems.map(item => ({
        JobNo: item.JobNo,
        MetalType: item.MetalTypeName,
        MetalPurity: item.MetalPurity,
        MetalColor: item.MetalColorName,
        autocode: item.AutoCode,
        NetWeight: String(item.NetWt),
        GrossWeight: String(item.GrossWt),
        dia_pcs: String(item.DiaPcs),
        dia_weight: String(item.DiaWt),
        cs_pcs: String(item.CsPcs),
        cs_weight: String(item.CsWt),
        Amount: item.Amount,
        FinalAmount: item.FinalAmount,
        DiscountAmount: item.DiscountAmount
    }));
};


export const MoveToEstimateApi = async (cartItems) => {
    const Device_Token = sessionStorage.getItem("device_token");
    const activeCust = JSON?.parse(sessionStorage.getItem("curruntActiveCustomer"));
    if (!activeCust?.CustomerId) {
        return console.error("CustomerId are required for moveToBillApi");
    }

    const productData = mapCartItemsToProductData(cartItems);

    try {
        const body = {
            Mode: "SaveEstimate",
            Token: `${Device_Token}`,
            ReqData: JSON.stringify([
                {
                    ForEvt: "SaveEstimate",
                    DeviceToken: Device_Token,
                    AppId: "3",
                    CustomerId: activeCust?.CustomerId,
                    ProductData: productData,
                },
            ]),
        };
        const response = await CommonAPI(body);
        return response?.Data || [];
    } catch (error) {
        console.error("Error in moveToBillApi:", error);
        return [];
    }
};
