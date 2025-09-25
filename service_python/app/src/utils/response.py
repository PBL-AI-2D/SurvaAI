def success_response(message: str, data: dict = None):
    return {
        "status": "success",
        "message": message,
        "data": data or {}
    }

def fail_response(message: str, data: dict = None):
    return {
        "status": "fail",
        "message": message,
        "data": data or {}
    }
