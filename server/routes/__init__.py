from .auth import auth_bp
from .products import products_bp
from .promote_employee import employees_bp
from .customers import customers_bp
from .shifts import shifts_bp
from .ingredients import ingredients_bp
from .transactions import transactions_bp  

__all__ = [
    "auth_bp",
    "products_bp",
    "employees_bp",
    "customers_bp",
    "shifts_bp",
    "ingredients_bp",
    "transactions_bp", 
    "reports_bp",
]
