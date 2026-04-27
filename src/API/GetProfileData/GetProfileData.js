import { CommonAPI } from "../CommonAPI/CommonAPI";

export const GetProfileData = async () => {

  let Device_Token = sessionStorage.getItem('device_token');

  try {
    const body = {
      Mode: "GetProfileData",
      Token: `"${Device_Token}"`,
      ReqData:
        `[{"ForEvt":"GetProfileData","DeviceToken":"${Device_Token}","AppId":"3"}]`,
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
