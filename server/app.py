import os
from flask import Flask
from flask_cors import CORS
from routes import auth_bp, products_bp, employees_bp
from dotenv import load_dotenv
from routes.customers import customers_bp
from routes.shifts import shifts_bp

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')


# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(employees_bp, url_prefix="/api/employees")
app.register_blueprint(customers_bp, url_prefix='/api/customers') 
app.register_blueprint(shifts_bp, url_prefix='/api/shifts')     

if __name__ == "__main__":
    app.run(debug=True, port=5001)