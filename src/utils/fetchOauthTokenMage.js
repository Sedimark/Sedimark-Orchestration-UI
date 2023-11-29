import axios from "axios";
import { FETCH_MAGE_AI_OAUTH_KEY } from "./apiEndpoints";

export const fetchCredentials = async()=>{
    const apiKey = process.env.REACT_APP_API_KEY;
    const email = process.env.REACT_APP_EMAIL;
    const password = process.env.REACT_APP_PASSWORD;

    const headers = {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey
    }

    const json_data = {
       "session": {
         "email": email,
         "password": password
     }
    }

    try{
      const response = await axios.post(FETCH_MAGE_AI_OAUTH_KEY,json_data,{
        headers:headers
      });
      return response.data.session.token;
    } catch(err){
      throw err;
    }
  }
