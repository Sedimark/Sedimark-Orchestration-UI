export const getAlgDescription = (algorithm) =>{

    if(algorithm == "Data featuring"){
        return "Data preprocessing is a crucial step in data analysis and machine learning. It involves a series of techniques and algorithms designed to clean, transform, and enhance raw data, making it suitable for analysis and modeling. These preprocessing algorithms handle tasks such as removing missing values, normalizing data, encoding categorical variables, and scaling features. By preparing data effectively, these algorithms lay the foundation for accurate and meaningful insights, enabling better decision-making and more accurate predictive models";
    } else if (algorithm == "Normalization"){
        return "Normalization algorithms are essential tools in data preprocessing. They focus on scaling numerical data to a standardized range, typically between 0 and 1 or -1 and 1, ensuring that all features have equal influence in machine learning models. These algorithms adjust the values of each data point proportionally, preserving the relative relationships between them. Normalization helps prevent certain features from dominating the model due to their larger scales, leading to more accurate and stable predictions in various data analysis tasks, from clustering to regression and classification.";
    } else if (algorithm == "Data Imputation"){
        return "Data imputation is a common technique used in data preprocessing to handle missing or incomplete data. It involves filling in missing values in a dataset with estimated or calculated values to make the data suitable for analysis. Data imputation is important because many data analysis and machine learning algorithms require complete datasets to work effectively.";
    }
}