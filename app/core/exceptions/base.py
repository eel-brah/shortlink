class BaseAppException(Exception):
    def __init__(self, detail: str | None = None):
        if detail:
            self.detail = detail

    status_code: int = 500
    detail: str = "Internal server error"


class NotFoundError(BaseAppException):
    status_code = 404
    detail = "Resource not found"


class ConflictError(BaseAppException):
    status_code = 409 
    detail = "Resource conflict (e.g., alias taken)"


class ValidationError(BaseAppException):
    status_code = 400
    detail = "Invalid input"
