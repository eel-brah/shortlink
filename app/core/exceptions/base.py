class BaseAppException(Exception):
    def __init__(self, detail: str | None = None):
        if detail:
            self.detail = detail

    status_code: int = 500
    detail: str = "Internal server error"


class UnauthorizedError(BaseAppException):
    status_code = 401
    detail = "Could not validate credentials"


class ForbiddenError(BaseAppException):
    status_code = 403
    detail = "Not enough permissions"


class NotFoundError(BaseAppException):
    status_code = 404
    detail = "Resource not found"


class GoneError(BaseAppException):
    status_code = 410
    detail = "Resource not available"


class ConflictError(BaseAppException):
    status_code = 409
    detail = "Resource conflict"


class ValidationError(BaseAppException):
    status_code = 400
    detail = "Invalid input"
