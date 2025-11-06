from flask import Flask
from flask_cors import CORS
from routes import auth_bp, products_bp, employees_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(employees_bp, url_prefix="/api/employees")

if __name__ == "__main__":
    app.run(debug=True, port=5001)
