
export const getVariablesForBlocks = (nodeId, blocksVariables)=>{
    const allVars = [];
    for(const blockVar of blocksVariables){
        const obj = {};
        if(blockVar.nodeId == nodeId){
            obj[blockVar.variable_name] = blockVar.value;
            allVars.push(obj);
        }
    }
    return allVars;
}