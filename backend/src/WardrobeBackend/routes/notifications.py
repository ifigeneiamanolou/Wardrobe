from fastapi import APIRouter, HTTPException, status, Depends
from src.WardrobeBackend.models.pydantic import Notification, User
from src.WardrobeBackend.services.notificationsServices import send_notification
from src.WardrobeBackend.utils.notification_backoff import retry
from src.WardrobeBackend.exceptions.expo import ExpoPushError, DeviceNotRegisteredError
from src.WardrobeBackend.exceptions.database import DatabaseError, DatabaseUnavailableError
from src.WardrobeBackend.services.database import add_push_notification
from src.WardrobeBackend.services.authentication import get_current_user
from typing import Annotated
from src.WardrobeBackend.routes.dependancies import MONGO_DEP

router = APIRouter()

@router.post("/send")
async def make_notification(
    data : Notification, 
    _ : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    # Send the notification to expo and receive the ticket
    try:
        ticket = await retry(
            func = lambda : send_notification(
                data.push_token, 
                data.title, 
                data.body
            ),
            should_retry = lambda err : isinstance(err, ExpoPushError) and err.retryable
        )
    except DeviceNotRegisteredError:
        raise HTTPException(
            status_code = status.HTTP_406_NOT_ACCEPTABLE, 
            detail = f'Not possible to send a notification to {data.username}' 
        ) 
    except ExpoPushError:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail = f'Not possible to send a notification to {data.username}' 
        ) 

    # Schedule fetch of push receipts after a set time
    try:
        id_inserted = await add_push_notification(ticket['id'], data.push_token, client)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    return {'message' : f'Sent notification to expo  and placed in db with id {id_inserted}'}

    