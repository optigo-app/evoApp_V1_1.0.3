import { CommonAPI } from "../CommonAPI/CommonAPI";

export const GetCartWishApi = async ({ mode }) => {
    let Device_Token = sessionStorage.getItem('device_token');
    if (!mode) {
        return console.error("Mode is required for GetCartApi");
    }
    const activeCust = JSON?.parse(sessionStorage.getItem('curruntActiveCustomer'));
    const reqData = [
        {
            ForEvt: mode,
            DeviceToken: `${Device_Token}`,
            AppId: "3",
            CustomerId: activeCust?.CustomerId,
            IsVisitor: activeCust?.IsVisitor,
        }
    ];
    try {
        const body = {
            Mode: mode,
            Token: `${Device_Token}`,
            ReqData: JSON.stringify(reqData),
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};
