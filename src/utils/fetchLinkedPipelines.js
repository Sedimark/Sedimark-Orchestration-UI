import axios from "axios";
import { FETCH_PIPELINES } from "./apiEndpoints";


export const fetchLinkedPipelinesOfType = async(pipeType)=>{

      try{
        const resp = await axios.get(FETCH_PIPELINES(pipeType));
        return resp.data;
      } catch(err){
        console.log(err);
        throw err;
      }
   }