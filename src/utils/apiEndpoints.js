export const FETCH_PIPELINES = `https://ingress.sedimark.work/mage-sedimark/pipelines`;
export const FETCH_MAGE_AI_OAUTH_KEY = `https://mage.sedimark.work/api/sessions`;
export const FETCH_PIPELINE_DATA = (pipeline_name)=>`https://ingress.sedimark.work/mage-sedimark/pipeline/read/full?pipeline_name=${pipeline_name}`;
export const FETCH_MINIO_FILE = (pipeline_name) => `https://ingress.sedimark.work/balancer/get_object?dataset_path=${pipeline_name}/statistics.json&forever=false`;
export const FETCH_MINIO_SAMPLE = (pipeline_name) => `https://ingress.sedimark.work/balancer/get_object?dataset_path=${pipeline_name}/head.json&forever=false`;
export const FETCH_PIPELINE_RUN_DATA = (pipeline_name) => `https://ingress.sedimark.work/mage-sedimark/pipeline/run_data?pipeline_name=${pipeline_name}`;
export const RUN_PIPELINE = "https://ingress.sedimark.work/mage-sedimark/pipeline/run";
export const BLOCK_STATUS = (pipeline_id, block_name) => `https://ingress.sedimark.work/mage-sedimark/pipeline/status_once?pipeline_id=${pipeline_id}&block_name=${block_name}`;
export const GET_ALL_MODELS = `http://localhost:7001/models`;
export const GET_PARAMETERS_FOR_MODEL = (model_name)=>`http://localhost:7001/model/parameters?name=${model_name}`;
export const GET_METRICS_FOR_MODEL = (model_name)=>`http://localhost:7001/model/metrics?name=${model_name}`;
export const PIPELINE_STATUS = (pipeline_id) => `https://ingress.sedimark.work/mage-sedimark/pipeline/batch_status?pipeline_id=${pipeline_id}`;

export const PIPELINE_HISTORY = (pipeline_name, limit) => `https://ingress.sedimark.work/mage-sedimark/pipeline/history?pipeline_name=${pipeline_name}&limit=${limit}`;