# This file makes routes a Python package
from .auth import auth_bp
from .products import products_bp
from .promote_employee import employees_bp
from .customers import customers_bp
from .shifts import shifts_bp

__all__ = ['auth_bp', 'products_bp', 'employees_bp', 'customers_bp', 'shifts_bp']
