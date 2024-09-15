import axios from "axios";
// const Api_Url = "https://get-hire-backend.vercel.app/";
// const Api_Url = process.env.REACT_APP_BACKEND_URL 
//                           ? process.env.REACT_APP_BACKEND_URL 
//                           : "https://gethire-backend.onrender.com/";
// const Api_Url = "https://gethire-backend.onrender.com/";
const Api_Url = "http://localhost:5000/"

const checkToken = (message) => {
  if (message === "Unauthorized") {
    alert("please login");
  }
};

const GetApi = async (apiEndpoint) => {
  try {
    const authToken = localStorage.getItem("companyToken");
    const response = await axios.get(`${Api_Url}${apiEndpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
    checkToken(response.data.message);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const PutApi = async (apiEndpoint, data) => {
  try {
    const authToken = localStorage.getItem("companyToken");
    const jsonData = JSON.stringify(data);
    const response = await axios.put(`${Api_Url}${apiEndpoint}`, jsonData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
    checkToken(response.data.message);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const GetApiwithouttoken = async (apiEndpoint) => {
  try {
    const response = await axios.get(`${Api_Url}${apiEndpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    checkToken(response.data.message);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const DeleteApi = async (apiEndpoint, id) => {
  try {
    const authToken = localStorage.getItem("companyToken");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    const response = await axios.delete(
      `${Api_Url}${apiEndpoint}/${id}`,
      config
    );
    checkToken(response.data.message);
    return response;
  } catch (error) {
    console.error("Error deleting priest:", error.response);
    throw error;
  }
};

const PostApi = async (apiEndpoint, postData) => {
  const authToken = localStorage.getItem("companyToken");
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };
    const postDataCopy = JSON.parse(JSON.stringify(postData));
    const response = await axios.post(
      `${Api_Url}${apiEndpoint}`,
      postDataCopy,
      config
    );
    checkToken(response.data.message);
    return response;
  } catch (error) {
    // alert(error.message);
    console.error("Error creating:", error);
    throw error;
  }
};

export { GetApi, PutApi, GetApiwithouttoken, DeleteApi, PostApi, Api_Url };
