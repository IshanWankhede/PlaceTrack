import re
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import DBAPIError, IntegrityError, SQLAlchemyError


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str = "ERROR"):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code


class NotFoundError(AppException):
    def __init__(self, detail: str = "Resource not found", code: str = "NOT_FOUND"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail, code=code)


class ConflictError(AppException):
    def __init__(self, detail: str = "Resource already exists", code: str = "CONFLICT"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail, code=code)


class ForbiddenError(AppException):
    def __init__(self, detail: str = "Forbidden", code: str = "FORBIDDEN"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail, code=code)


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Not authenticated", code: str = "UNAUTHORIZED"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, code=code)


def extract_pg_message(orig: Exception) -> str:
    """Extracts a user-friendly error message from a psycopg2/Postgres exception."""
    diag = getattr(orig, "diag", None)
    if diag and diag.message_primary:
        return diag.message_primary
    # Fallback cleanup of psycopg2 error string
    msg = str(orig)
    if "CONTEXT:" in msg:
        msg = msg.split("CONTEXT:")[0]
    if "DETAIL:" in msg:
        msg = msg.split("DETAIL:")[0]
    return msg.strip()


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": exc.code},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "UNPROCESSABLE_ENTITY",
        }
        code = code_map.get(exc.status_code, "ERROR")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": code},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        first_err = exc.errors()[0] if exc.errors() else {}
        loc = " -> ".join(str(l) for l in first_err.get("loc", []))
        msg = first_err.get("msg", "Validation error")
        detail = f"{loc}: {msg}" if loc else msg
        # Ensure errors list is JSON-serializable (convert all values to str)
        safe_errors = [
            {k: str(v) if not isinstance(v, (str, int, float, bool, type(None), list)) else v
             for k, v in err.items()}
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": detail, "code": "VALIDATION_ERROR", "errors": safe_errors},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        orig = exc.orig
        pgcode = getattr(orig, "pgcode", None)
        msg = extract_pg_message(orig)

        if pgcode == "23505":  # unique_violation
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"detail": msg or "Duplicate key violation", "code": "UNIQUE_VIOLATION"},
            )
        elif pgcode == "23503":  # foreign_key_violation
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"detail": msg or "Referenced resource violation", "code": "FOREIGN_KEY_VIOLATION"},
            )
        elif pgcode == "23514":  # check_violation
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"detail": msg or "Check constraint violation", "code": "CHECK_VIOLATION"},
            )
        elif pgcode == "23502":  # not_null_violation
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"detail": msg or "Not null constraint violation", "code": "NOT_NULL_VIOLATION"},
            )

        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": msg or "Integrity error", "code": "INTEGRITY_ERROR"},
        )

    @app.exception_handler(DBAPIError)
    async def dbapi_error_handler(request: Request, exc: DBAPIError):
        orig = exc.orig
        pgcode = getattr(orig, "pgcode", None)
        msg = extract_pg_message(orig)

        # SQLSTATE P0001: PostgreSQL raise_exception (from triggers/functions/procedures)
        if pgcode == "P0001":
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"detail": msg, "code": "TRIGGER_RAISE_EXCEPTION"},
            )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": msg or "Database execution error", "code": "DATABASE_ERROR"},
        )
