export const parseJSONVar = (typeData)=>{
    try{
        return JSON.parse(typeData);
    } catch (err){
        return null;
    }
}