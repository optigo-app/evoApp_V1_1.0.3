import { CommonAPI } from "../CommonAPI/CommonAPI";

export const AddCartFromWishListApi = async ({
    flag,
    cartWishData,
    IsMoveAll = 0,
}) => {
    const Device_Token = sessionStorage.getItem("device_token");
    if (!cartWishData) {
        return console.error("cartWishData are required for AddCartFromWishListApi");
    }
    try {
        const body = {
            Mode: "AddCartFromWishList",
            Token: `${Device_Token}`,
            ReqData: JSON.stringify([
                {
                    ForEvt: "AddCartFromWishList",
                    DeviceToken: Device_Token,
                    AppId: "3",
                    CartWishId: flag == "single" ? cartWishData?.CartWishId : "",
                    CustomerId: cartWishData?.CustomerId,
                    IsVisitor: cartWishData?.IsVisitor,
                    IsMoveAll: IsMoveAll,
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
