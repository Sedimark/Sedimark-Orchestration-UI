export const getMLAlgDescription = (algorithm) =>{

    if(algorithm == "ResNet (Residual Neural Network)"){
        return "ResNet (Residual Network) is a deep learning algorithm in machine learning and computer vision. It's renowned for its ability to train very deep neural networks effectively, overcoming the challenges of vanishing gradients during training. ResNet introduces the concept of residual blocks, which contain shortcut connections that skip one or more layers.";
    } else if (algorithm == "BERT (Bidirectional Encoder Representations from Transformers)"){
        return "BERT, which stands for Bidirectional Encoder Representations from Transformers, is a natural language processing (NLP) model developed by Google in 2018. It represents a significant advancement in the field of NLP and has had a substantial impact on various NLP applications and tasks.";
    } else if (algorithm == "Random Forest"){
        return "Random Forest is a versatile machine learning algorithm used for both classification and regression tasks. It is an ensemble learning method that combines multiple decision trees to make predictions. Here are some key points about Random Forest";
    } else if (algorithm == "SVM (Support Vector Machine)"){
        return "Support Vector Machine (SVM) is a powerful machine learning algorithm used for classification and regression tasks. It works by finding the optimal hyperplane that best separates data points into different classes while maximizing the margin between the classes. SVM is known for its effectiveness in handling high-dimensional data and its ability to handle non-linear relationships through kernel functions.";
    }
}