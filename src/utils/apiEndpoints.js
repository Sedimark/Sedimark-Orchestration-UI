export const DATASET_FETCH_ALL_DATASETS = "http://localhost:8089/api/dataset/all-datasets";
export const DATASET_FETCH_DATASET_INFO = (id)=>`http://localhost:8089/api/dataset/dataset-info?id=${id}`;
export const DATASET_FETCH_DATASET_SNIPPET = (id)=>`http://localhost:8089/api/dataset/fetch-snippet?id=${id}`;
export const START_PIPELINE = `http://localhost:8081/start_pipeline`;
export const FETCH_PIPELINES = `http://localhost:7000/pipelines`;
export const FETCH_MAGE_AI_OAUTH_KEY = `https://mage.sedimark.work/api/sessions`;
export const FETCH_PIPELINE_DATA = (pipeline_name)=>`http://localhost:7000/pipeline/read?pipeline_name=${pipeline_name}`;
export const FETCH_MINIO_FILE = (pipeline_name) => `http://62.72.21.79:10000/get_object?dataset_path=${pipeline_name}/statistics.json`;