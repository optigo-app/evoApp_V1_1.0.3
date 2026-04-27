import { CommonAPI } from "../CommonAPI/CommonAPI";

export const moveToBillApi = async () => {
    const Device_Token = sessionStorage.getItem("device_token");
    const activeCust = JSON?.parse(sessionStorage.getItem("curruntActiveCustomer"));
    if (!activeCust?.CustomerId) {
        return console.error("CustomerId are required for moveToBillApi");
    }
    try {
        const body = {
            Mode: "MoveToBill",
            Token: `${Device_Token}`,
            ReqData: JSON.stringify([
                {
                    ForEvt: "MoveToBill",
                    DeviceToken: Device_Token,
                    AppId: "3",
                    CustomerId: activeCust?.CustomerId,
                    IsVisitor: activeCust?.IsVisitor,
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
