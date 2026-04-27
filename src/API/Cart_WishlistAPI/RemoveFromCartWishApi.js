import { CommonAPI } from "../CommonAPI/CommonAPI";

export const RemoveFromCartWishApi = async ({
  mode,
  flag,
  pageFlag,
  cartWishData,
  IsRemoveAll = 0,
}) => {
  const Device_Token = sessionStorage.getItem("device_token");
  if (!mode && !cartWishData) {
    return console.error("Mode are required for RemoveFromCartWishApi");
  }
  try {
    const body = {
      Mode: mode || "",
      Token: `${Device_Token}`,
      ReqData: JSON.stringify([
        {
          ForEvt: mode,
          DeviceToken: Device_Token,
          AppId: "3",
          JobNo: cartWishData?.JobNo || "",
          CartWishId: pageFlag == "wish" ? '0' : (flag == "single" ? cartWishData?.CartWishId : ""),
          CustomerId: cartWishData?.CustomerId,
          IsVisitor: cartWishData?.IsVisitor,
          IsRemoveAll: IsRemoveAll,
        },
      ]),
    };
    const response = await CommonAPI(body);
    return response?.Data || [];
  } catch (error) {
    console.error("Error in RemoveFromCartApi:", error);
    return [];
  }
};
