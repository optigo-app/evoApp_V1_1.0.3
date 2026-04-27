import axios from "axios";

const APIURL = (window.location.hostname === 'localhost'
  || window.location.hostname === 'nzen'
) ? 'http://nzen/jo/ExpressApp/EvoApp.aspx' : 'https://view.optigoapps.com/ExpressApp/EvoApp.aspx';

// const APIURL = "https://view.optigoapps.com/ExpressApp/EvoApp.aspx";
// const APIURL = "https://livenx.optigoapps.com/api/report";
// const APIURL = "http://nzen/jo/ExpressApp/EvoApp.aspx";

export const CommonAPI = async (body) => {
  const spV = sessionStorage.getItem("SpVer");
  try {
    const header = {
      "Content-Type": "application/json",
      // SpVer: "V1"
      SpVer: spV
    };
    const response = await axios.post(APIURL, body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};
