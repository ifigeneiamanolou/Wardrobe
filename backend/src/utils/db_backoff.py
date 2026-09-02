import functools
from pymongo.errors import AutoReconnect, ConnectionFailure 
import time

# Decorator used to execute a function multiple times through exponential backoff
def with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2):
    def decorator(func):            # Decorator: receives a function and returns a new one
        @functools.wraps(func)      # Useful for debugging to retain the docstring and name of func
        def wrapper(*args, **kwargs):       # The function that actually runs in the place of func
            delay = base_delay
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except (AutoReconnect, ConnectionFailure) as e:
                    if attempt == max_attempts:
                        raise RuntimeError("Unable to execute database query")
                    print(f"Attempt {attempt}/{max_attempts} to execute db query")
                    time.sleep(delay)
                    delay *= backoff
        return wrapper
    return decorator