import sys
import json
import mysql.connector
import pandas as pd
# from sklearn.cluster import KMeans
# from sklearn.preprocessing import StandardScaler
import os
from dotenv import load_dotenv
import matplotlib.pyplot as plt


load_dotenv()

def connect_to_database():
    """Establish connection to the database."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        database="CRM"
    )

def fetch_data_from_database():
    """Fetch country data from the database."""
    connection = connect_to_database()
    cursor = connection.cursor(dictionary=True)
    
    # Query to get the data (Assuming there is a column 'country' in your table)
    query = "SELECT country, COUNT(*) as count FROM customers GROUP BY country  ORDER BY count DESC limit 10 OFFSET 0"
    cursor.execute(query)
    
    # Fetch the result
    data = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return data

def visualize_country_distribution(data):
    """Visualize country distribution as a percentage in a pie chart."""
    # Convert the data into a pandas DataFrame
    df = pd.DataFrame(data)
    print(df)

    # Calculate the total number of customers
    total_count = df['count'].sum()
    print(total_count)

    # Calculate the percentage of each country
    df['percentage'] = (df['count'] / total_count) * 100

    # Plot the pie chart
    plt.figure(figsize=(8, 8))
    plt.pie(df['percentage'], labels=df['country'], autopct='%1.1f%%', startangle=140, colors=plt.cm.Paired.colors)
    plt.title('Customer Distribution by Country')
    plt.axis('equal')  
    plt.show()
    
    #plot a bar chart
    
    plt.figure(figsize=(16, 8))
    plt.bar(df['country'], df['percentage'])
    plt.xlabel('Country', fontsize=12)
    plt.ylabel('Percentage')
    plt.title('Customer Distribution by Country')
    plt.show()

if __name__ == "__main__":
    data = fetch_data_from_database()
    # print(data)
    visualize_country_distribution(data)
