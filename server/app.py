from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)  # Allow React frontend to access API

@app.route("/api/products", methods=["GET"])
def get_products():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO products (name, description, price, stock) VALUES (%s, %s, %s, %s)",
        (data["name"], data["description"], data["price"], data["stock"])
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product added successfully!"})

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"Product {product_id} deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
