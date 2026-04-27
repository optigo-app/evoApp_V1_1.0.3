import { CommonAPI } from "../CommonAPI/CommonAPI";

export const CallApi = async (body) => {
  try {
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
