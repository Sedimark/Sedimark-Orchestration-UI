import {createSlice, nanoid} from '@reduxjs/toolkit'

const initialState = {
    selectedView:[1],
    nodes:[],
    selectedTrainedModel:"",
    isPredictSelected:false,
    datasetColumnNames:[],
    selectedPipeline:[],
    selectedModelType:"",
    edgeToDelete:"",
    mappedNodes:[], 
    edges:[],
    mageAIOauthToken:"",
    dataset_info:[],
    dataset_columns:[],
    is_data_fetching:false,
    blocksVariables:[],
    orderedNodes: [],
    selectedPipelineName: "",
    selectedPipelineNameDataPreprocessing:"",
    selectedPipelineNameTrain:"",
    selectedPipelineNamePrediction:"",
    storedNodes:[],
    selectedPipelineTrain:[],
    selectedPipelineDataPreprocessing:[],
    selectedPipelinePrediction:[],
    noPipelineFound:false,
    selectedTab:{"changed":false, tabSelected:"1"},
    mapData:"",
    pipelineNrOfVariables:[]
    
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
        setPipelineNumberOfVariables:(state,action)=>{
            state.pipelineNrOfVariables = action.payload;
        },
        setSelectedTrainedModel:(state, action)=>{
            state.selectedTrainedModel = action.payload;
        },
        setIsPredictedSelected:(state, action)=>{
            state.isPredictSelected = action.payload;
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
        setSelectedModelType:(state,action)=>{
            state.selectedModelType = action.payload;
        },
        setEdgeToDelete:(state,action)=>{
            
            state.edgeToDelete = action.payload;
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
         },
         addPipelineTrain:(state, action)=>{
            state.selectedPipelineTrain = [];
            state.selectedPipelineTrain = [action.payload];
        },
        addPipelinePreprocessing:(state, action)=>{
            state.selectedPipelineDataPreprocessing = [];
            state.selectedPipelineDataPreprocessing = [action.payload];
        },
        clearPipelineProcessing:(state, action)=>{
            state.selectedPipelineDataPreprocessing = [];
        },
        clearPipelineTrain:(state, action)=>{
            state.selectedPipelineTrain = [];
        },
        setSelectedPipelineNameTrain:(state, action)=>{
            
            state.selectedPipelineNameTrain = action.payload;
        },

        setSelectedPipelineNamePreprocessing:(state, action)=>{
            state.selectedPipelineNameDataPreprocessing = action.payload;
        },
        setSelectedView:(state,action)=>{
            state.selectedView = action.payload;
        },
        setSelectedPipelinePrediction:(state,action)=>{
            state.selectedPipelinePrediction = action.payload;
        },
        setSelectedPipelineNamePrediction:(state,action)=>{
            state.selectedPipelineNamePrediction = action.payload;
        },
        setMapData:(state,action)=>{
            state.mapData = action.payload;
        },
        
        setNoPipelineFound:(state,action)=>{
            state.noPipelineFound = action.payload;
        },

        setSelectedTab:(state, action) =>{
            state.selectedTab = action.payload;
        }

    }
});


export const { setPipelineNumberOfVariables, setSelectedTab, setNoPipelineFound ,setSelectedPipelineNamePrediction ,setSelectedPipelinePrediction,setSelectedTrainedModel, setIsPredictedSelected ,setSelectedView, clearPipelineProcessing, clearPipelineTrain, setSelectedPipelineNameTrain, setSelectedPipelineNamePreprocessing, addPipelinePreprocessing, addPipelineTrain ,setDatasetColumnNames, setStoredNodes, setBlocksVariables, setIsDataFetching ,setDatasetColumns ,setDatasetInfo , setMappedNodes, setMappedEdges, resetSelectedModelType, addNode,setNodes,removeNode , addPipeline, addAlgorithm, setSelectedModelType, setSelectedDataFeaturingColumns, setEdgeToDelete, clearPipeline, setMageAIOauthToken, setOrderedNodes, setSelectedPipelineName, setMapData} = nodeSlice.actions

export default nodeSlice.reducer;