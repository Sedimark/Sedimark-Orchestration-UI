import {createSlice, nanoid} from '@reduxjs/toolkit'
import { act } from 'react-dom/test-utils';

const initialState = {
    nodes:[],
    datasetColumnNames:[],
    selectedPipeline:[],
    selectedModelType:"",
    selectedDataFeaturingColumns:[],
    normalizationColumns:[],
    standardizationColumns:[],
    imputationAlgs:[],
    edgeToDelete:"",
    mappedNodes:[],
    constant_value_imputation_columns:[],
    constant_value_imputation_values:[],
    edges:[],
    mageAIOauthToken:"",
    dataset_info:[],
    dataset_columns:[],
    is_data_fetching:false,
    blocksVariables:[],
    orderedNodes: [],
    selectedPipelineName: "",
    storedNodes:[]
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
        setStoredNodes:(state, action)=>{
            state.storedNodes = action.payload;
        },
        setBlocksVariables:(state,action)=>{
            state.blocksVariables = action.payload;
        },
        setIsDataFetching:(state,action)=>{
            state.is_data_fetching = action.payload;
        },
        setDatasetColumns:(state,action)=>{
            state.dataset_columns = action.payload;
        },
        setDatasetInfo:(state,action)=>{
            state.dataset_info = action.payload;
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
        clearPipeline:(state,action)=>{
            state.selectedPipeline = [];
        },
        addPipeline:(state,action) =>{
            state.selectedPipeline = [];
            state.selectedPipeline = [action.payload]
        },
        removeDataset:(state,action) =>{
            state.selectedPipeline = [];
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
        },
        setMageAIOauthToken:(state, action)=>{
            state.mageAIOauthToken = action.payload;
        },
         setOrderedNodes:(state, action) => {
            state.orderedNodes = action.payload;
         },
         setSelectedPipelineName:(state, action) => {
            state.selectedPipelineName = action.payload;
         },

         setDatasetColumnNames:(state, action)=>{
            state.datasetColumnNames = action.payload;
         }
    }
});


export const {setDatasetColumnNames, setStoredNodes, setBlocksVariables, setIsDataFetching ,setDatasetColumns ,setDatasetInfo ,setStoredConstantValueImputationValues, setConstantValueImputationColumns,setMappedNodes, setMappedEdges, resetSelectedModelType, resetNormalizationAndStandardization, removeDataFeaturingColumns, addNode,setNodes,removeDataset,removeNode , addPipeline, addAlgorithm, setSelectedModelType, setSelectedDataFeaturingColumns,setNormalizationColumns,setStandardizationColumns,setImputationAlgs, setEdgeToDelete, clearPipeline, removePreProcessingNodes,setMageAIOauthToken, setOrderedNodes, setSelectedPipelineName} = nodeSlice.actions

export default nodeSlice.reducer;