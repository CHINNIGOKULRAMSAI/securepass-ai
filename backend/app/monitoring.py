from prometheus_fastapi_instrumentator import Instrumentator


def setup_monitoring(app):

    Instrumentator().instrument(app).expose(app)