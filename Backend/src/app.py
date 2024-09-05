from flask import Flask, request, jsonify
import joblib
import pandas as pd
from datetime import datetime
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the saved model and polynomial features
model = joblib.load('polynomial_regression_model.pkl')
poly = joblib.load('polynomial_features.pkl')

# Function to filter predictions
def filter_data(data):
    data[data < 0] = 0
    return data.astype(int)

# Helper function to process the time range into a meaningful feature (e.g., total hours)
def process_time_range(time_range):
    start_time = datetime.fromisoformat(time_range[0].replace("Z", "+00:00"))
    end_time = datetime.fromisoformat(time_range[1].replace("Z", "+00:00"))
    total_hours = (end_time - start_time).total_seconds() / 3600
    return total_hours

# Define a route to handle predictions
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from the request
        data = request.get_json()

        # Process the time range
        time_in_hours = process_time_range(data['timeRange'])

        # Convert location, weather, and dayType to numeric values (you can adjust these mappings)
        location_mapping = {'urban': 1, 'suburban': 2, 'rural': 3}
        weather_mapping = {'sunny': 0, 'rainy': 1, 'snowy': 2}
        daytype_mapping = {'weekday': 0, 'weekend': 1}

        # Create a DataFrame for the input features
        new_data = pd.DataFrame({
            'Time': [time_in_hours],
            'sta': [location_mapping.get(data['location'], 1)],  # Default to 'urban' if not found
            'wether': [weather_mapping.get(data['weather'], 0)],  # Default to 'sunny' if not found
            'week or weekend': [daytype_mapping.get(data['dayType'], 0)]  # Default to 'weekday' if not found
        })

        # Transform input data with polynomial features
        new_data_poly = poly.transform(new_data)

        # Get the prediction
        predictions = model.predict(new_data_poly)

        # Apply filter to the prediction
        filtered_prediction = filter_data(predictions)[0]

        # Return the prediction as a JSON response
        return jsonify({'prediction': int(filtered_prediction)})

    except Exception as e:
        return jsonify({'error': str(e)})

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
