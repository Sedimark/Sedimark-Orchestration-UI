export const parseTheDescription = (typeData)=>{
    try{
      const parsedTypeData = JSON.parse(typeData);
      return parsedTypeData["description"];
    } catch (err){
      return null;
    }
  }