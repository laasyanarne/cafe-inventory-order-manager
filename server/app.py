import os
from flask import Flask
#from flask_cors import CORS
from routes import auth_bp, products_bp, employees_bp, customers_bp, shifts_bp
from dotenv import load_dotenv
from routes.inventory import inventory_bp
from routes.stocks import stocks_bp

load_dotenv()

app = Flask(__name__)

from flask_cors import CORS

CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True,
    resources={r"/api/*": {"origins": "*"}},  # ✅ ADD THIS LINE
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)


#CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')


# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(employees_bp, url_prefix="/api/employees")
app.register_blueprint(customers_bp, url_prefix="/api/customers")
app.register_blueprint(shifts_bp, url_prefix="/api/shifts")
app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(stocks_bp, url_prefix="/api/stocks")


if __name__ == "__main__":
    app.run(debug=True, port=5001)
