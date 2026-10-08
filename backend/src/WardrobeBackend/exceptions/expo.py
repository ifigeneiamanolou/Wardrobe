from typing import Optional
class ExpoPushError(Exception):
    def __init__(self, message : str, status : Optional[int | str], retryable : bool = True):
        super().__init__(message)
        self.exception_status = status
        self.retryable = retryable

class DeviceNotRegisteredError(Exception):
    def __init__(self, push_token : str, retryable : bool = True):
        super().__init__()
        self.push_token = push_token
        self.retryable = retryable
