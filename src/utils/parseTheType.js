export const parseTheType = (typeData)=>{
    
    try{
      const parsedTypeData = JSON.parse(typeData);
      return parsedTypeData["type"];
    } catch (err){
      return null;
    }
  }