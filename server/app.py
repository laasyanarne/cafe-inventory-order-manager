import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import all blueprints
from routes import auth_bp, products_bp, employees_bp, ingredients_bp, transactions_bp
from routes.customers import customers_bp
from routes.shifts import shifts_bp
from routes.inventory import inventory_bp
from routes.stocks import stocks_bp
from routes.reports import reports_bp

load_dotenv()

app = Flask(__name__)

# Unified CORS configuration
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# JWT Secret
app.config["JWT_SECRET"] = os.getenv("JWT_SECRET")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(employees_bp, url_prefix="/api/employees")
app.register_blueprint(customers_bp, url_prefix="/api/customers")
app.register_blueprint(shifts_bp, url_prefix="/api/shifts")
app.register_blueprint(ingredients_bp, url_prefix="/api/ingredients")
app.register_blueprint(transactions_bp, url_prefix="/api/transactions")
app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(stocks_bp, url_prefix="/api/stocks")
app.register_blueprint(reports_bp, url_prefix="/api/reports")

if __name__ == "__main__":
    app.run(debug=True, port=5001)
