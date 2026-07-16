import os
import tempfile
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

# Aiven (and other managed MySQL services) require TLS.
# DB_SSL_CA can be either:
#   - a filesystem path to a CA cert file  (local dev with downloaded cert)
#   - the raw PEM content of the CA cert   (Render env var — no filesystem needed)
#
# In the PEM-content case the cert is written to a temp file once at import
# time so mysql-connector-python can reference it by path.
_ssl_ca_path = None
_ssl_ca_raw = os.getenv("DB_SSL_CA", "").strip()

if _ssl_ca_raw:
    if os.path.isfile(_ssl_ca_raw):
        # Value is a path to an existing file — use it directly.
        _ssl_ca_path = _ssl_ca_raw
    else:
        # Value is PEM content — write to a temp file once at startup.
        _tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".pem", delete=False, prefix="aiven_ca_"
        )
        _tmp.write(_ssl_ca_raw)
        _tmp.close()
        _ssl_ca_path = _tmp.name


def get_connection():
    kwargs = dict(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME"),
    )
    if _ssl_ca_path:
        kwargs["ssl_ca"] = _ssl_ca_path
        kwargs["ssl_verify_cert"] = True
        kwargs["ssl_verify_identity"] = True
    return mysql.connector.connect(**kwargs)
