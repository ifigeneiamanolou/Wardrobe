import asyncio
from typing import Callable, Awaitable, TypeVar

T = TypeVar('T')

def retry(func: Callable[[], Awaitable[T]],
    maxRetries : int = 10, 
    max_delay = 30.000,
    should_retry: Callable[[Exception], bool] = lambda err: True,
):
    async def retryWithBackOff(retries : int):
        try:
            if(retries > 0):
                delay = 2 ** retries * 100;
                await asyncio.sleep(min(delay, max_delay) / 1000)
            return await func()
        except Exception as e:
            if(retries < maxRetries & should_retry(e)):
                print(f"Attempt {retries + 1}/{maxRetries}")
                return retryWithBackOff(retries + 1)
            else:
                print(f"Max attempts reached")
                raise
    return retryWithBackOff(0)
                

