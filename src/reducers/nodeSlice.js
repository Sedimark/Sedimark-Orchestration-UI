import {createSlice, nanoid} from '@reduxjs/toolkit'

const initialState = {
    nodes:[],
    selectedDataset:[],
    selectedModelType:"",
    selectedDataFeaturingColumns:[],
    normalizationColumns:[],
    standardizationColumns:[],
    imputationAlgs:[],
    edgeToDelete:"",
    mappedNodes:[],
    constant_value_imputation_columns:[],
    constant_value_imputation_values:[],
    edges:[]
}

export const nodeSlice = createSlice({
    name:'nodes',
    initialState,
    reducers:{
        addNode: (state,action) => {
            
            const newNode = {
                id:nanoid(),
                nodeData:action.payload
            }
            const containsID = state.nodes.filter(obj => obj.nodeData.type == action.payload.type );
            if(containsID.length == 0)
            {
                state.nodes.push(newNode);
            }
            
        },
        setConstantValueImputationColumns:(state,action)=>{
            state.constant_value_imputation_columns = action.payload
        },
        setStoredConstantValueImputationValues:(state,action)=>{
            state.constant_value_imputation_values = action.payload
        },
        setMappedNodes:(state, action)=>{
            state.mappedNodes = action.payload;
        },
        setMappedEdges:(state, action)=>{
            state.edges = action.payload
        },
        setNodes:(state, action)=>{
            
            state.nodes = action.payload
        },
        removeNode:(state, action) =>{
            state.nodes = state.nodes.filter((node)=> node.id !== action.payload)
        }, 
        removePreProcessingNodes:(state, action)=>{
           
        },
        resetSelectedModelType:(state, action)=>{
            state.selectedModelType = "";
        },
        clearDataset:(state,action)=>{
            state.selectedDataset = [];
        },
        addDataset:(state,action) =>{
            state.selectedDataset = [];
            state.selectedDataset = [action.payload]
        },
        removeDataset:(state,action) =>{
            state.selectedDataset = [];
        },
        removeDataFeaturingColumns:(state,action)=>{
            state.selectedDataFeaturingColumns = [];
        },
        setSelectedModelType:(state,action)=>{
            state.selectedModelType = action.payload;
        },
        setSelectedDataFeaturingColumns:(state,action) =>{
            state.selectedDataFeaturingColumns = action.payload
        },
        setNormalizationColumns:(state, action)=>{
            state.normalizationColumns = action.payload;
        },
        setStandardizationColumns:(state,action)=>{
            state.standardizationColumns = action.payload;
        },
        setImputationAlgs:(state,action) =>{
            state.imputationAlgs = action.payload;
        },
        setEdgeToDelete:(state,action)=>{
            
            state.edgeToDelete = action.payload;
        },
        resetNormalizationAndStandardization:(state) =>{
            state.normalizationColumns = [];
            state.standardizationColumns = [];
        }
         
    }
});


export const {setStoredConstantValueImputationValues, setConstantValueImputationColumns,setMappedNodes, setMappedEdges, resetSelectedModelType, resetNormalizationAndStandardization, removeDataFeaturingColumns, addNode,setNodes,removeDataset,removeNode , addDataset, addAlgorithm, setSelectedModelType, setSelectedDataFeaturingColumns,setNormalizationColumns,setStandardizationColumns,setImputationAlgs, setEdgeToDelete, clearDataset, removePreProcessingNodes} = nodeSlice.actions

export default nodeSlice.reducer;