export const FETCH_PIPELINES = (pipelineType)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipelines?tag=${pipelineType}`;
export const FETCH_PIPELINE_DATA = (pipeline_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/read/full?pipeline_name=${pipeline_name}`;
export const FETCH_PIPELINE_PREDICT_DATA = (pipeline_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/read/predict/full?model_name=${pipeline_name}`;
export const FETCH_MINIO_FILE = (pipeline_name) => `https://${process.env.REACT_APP_MAGE_API_URL}/balancer/get_object?dataset_path=${pipeline_name}/statistics.json&forever=false`;
export const FETCH_MINIO_SAMPLE = (pipeline_name) => `https://${process.env.REACT_APP_MAGE_API_URL}/balancer/get_object?dataset_path=${pipeline_name}/head.json&forever=false`;
export const FETCH_PIPELINE_RUN_DATA = (pipeline_name) => `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/triggers?name=${pipeline_name}`;
export const RUN_PIPELINE = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/run`;
export const GET_ALL_MODELS = `https://${process.env.REACT_APP_MAGE_API_URL}/sm/models`;
export const GET_PARAMETERS_FOR_MODEL = (model_name,version)=>`https://${process.env.REACT_APP_MAGE_API_URL}/sm/model/parameters?name=${model_name}&version=${version}`;
export const GET_METRICS_FOR_MODEL = (model_name, version)=>`https://${process.env.REACT_APP_MAGE_API_URL}/sm/model/metrics?name=${model_name}&version=${version}`;
export const GET_TRAINING_METRICS_IMAGES = (model_name, version) => `https://${process.env.REACT_APP_MAGE_API_URL}/sm/model/images?name=${model_name}&version=${version}`;
export const PIPELINE_STATUS = (pipeline_id) => `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/status/batch?pipeline_id=${pipeline_id}`;
export const PIPELINE_HISTORY = (pipeline_name, limit) => `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/history?pipeline_name=${pipeline_name}&limit=${limit}`;
export const PREDICT_RESULTS_LINK = (model_name) => `https://ingress.sedimark.work/balancer/get_object?dataset_path=${model_name.split("_").join("-")}/map.html&forever=false`;
export const MODEL_VERSION = (model_name) => `https://${process.env.REACT_APP_MAGE_API_URL}/sm/model/versions?name=${model_name}`;
export const RUN_STREAMING_PIPELINE = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/trigger/update`;
export const STREAMING_PIPELINE_STATUS = (pipeline_name) => `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/status/streaming?pipeline_name=${pipeline_name}`
export const FETCH_ALL_BLOCKS = (pipeline_type) => `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/templates?pipeline_type=${pipeline_type}`;
export const SAVE_PIPELINE = (pipeline_name) => `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/create?name=${pipeline_name}&ptype=python`;
export const TAG_PIPELINE = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/create/tag`;
export const GET_BLOCK_CODE = (block_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/block/model?block_name=${block_name}`;
export const SAVE_BLOCK = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/block/create`;
export const SAVE_TEMPLATE = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/block/template/create`;
export const GENERATE_BLOCK_WS = `wss://${process.env.REACT_APP_MAGE_API_URL}/mage/block/generate`;
export const CREATE_TRIGGER = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/create/trigger`;
export const EXPORT_PIPELINE_CWL = (pipeline_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/export/cwl?pipeline_name=${pipeline_name}`;
export const EXPORT_PIPELINE_MAGE = (pipeline_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/export?pipeline_name=${pipeline_name}`;
export const DELETE_PIPELINE = (pipeline_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/delete?name=${pipeline_name}`;
export const RENAME_PIPELINE = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipeline/rename`;
export const MAGE_SETTINGS = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/server/set`;
export const CHECK_BLOCK_WS = `wss://${process.env.REACT_APP_MAGE_API_URL}/mage/validate`;
export const ADD_TO_RAG = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/rag/add`;
export const FETCH_ALL_PIPELINES = `https://${process.env.REACT_APP_MAGE_API_URL}/mage/pipelines`; 
export const PIPELINE_METRICS = (pipeline_name)=>`https://${process.env.REACT_APP_MAGE_API_URL}/mage/file/telemetry?pipeline_name=${pipeline_name}`;
export const LOGS_FOR_PIPELINE = (pipeline_name, block_name)=> `https://${process.env.REACT_APP_MAGE_API_URL}/mage/log/pipeline/${pipeline_name}/${block_name}`;


