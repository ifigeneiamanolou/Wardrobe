import requests
from src.exceptions.expo import ExpoPushError, DeviceNotRegisteredError
import asyncio 
from src.services.database import retrieve_push_notifications
from src.utils.notification_backoff import retry
from datetime import datetime, timedelta
from pymongo import MongoClient

async def send_notification(push_token : str, title : str, body : str):
    headers = {
        'Host': 'exp.host',
        'Accept' : 'application/json',
        'Accept-Encoding' : 'gzip, deflate',
        'Content-Type' : 'application/json'
    }
    url = 'https://exp.host/--/api/v2/push/send'
    request_body = {
        "to": push_token,
        "title": title,
        "body": body,
        "channel id" : "default"
    }

    response = requests.post(url = url, headers = headers, json = request_body)
    if(response.status_code == 429 or response.status_code >= 500):
        raise ExpoPushError(
            f"HTTP {response.status_code}", 
            response.status_code,
            response.status_code == 429 or response.status_code >= 500
        )
    response_body = response.json()
    print(response_body)
    if(response_body['data']['status'] != 'ok'):
        if(response_body['data']['details']['error'] == 'DeviceNotRegistered'):
            raise DeviceNotRegisteredError
        raise ExpoPushError(
            f"Response body : {response_body['data'][0]['message']}",
            response_body['data']['details']['error'],
            response.status_code == 429 or response.status_code >= 500
        )
    return response_body['data']

async def retrieve_receipts(ticket_ids : list[str]):
    print(f'Fetching receipt for notification with id {id}')
    url = "https://exp.host/--/api/v2/push/getReceipts"
    response = requests.post(
        url = url, 
        headers = {
            "Accept" : "application/json",
            "Content-Type" : "application/json"
        },
        json = {"ids" : ticket_ids}
    )

    if(response.status_code != 200):
        raise ExpoPushError(
            f"HTTP {response.status_code}", 
            response.status_code,
            response.status_code == 429 or response.status_code >= 500
        )
    data = response.json()

    if "errors" in data:
        raise ExpoPushError(
            f"errors : {data['errors']}", 
            response.status_code,
            True
        )
    return data["data"]

async def check_receipts_batch(results : list):
    # Ensure that only 1000 tickets are sent at a time
    for i in range(0, len(results), 1000): 
        if i + 1000 < len(results):
            batch = results[i : i + 1000]
        else:
            batch = results[i, len(results)]
        ticket_ids = [row['ticket_id'] for row in batch]

        # Try to retrieve the receipts with exponential backoff
        try:
            receipts = await retry(
                func = retrieve_receipts(ticket_ids),
                should_retry = lambda err : isinstance(err, ExpoPushError) and err.retryable
            )
        except ExpoPushError:
            print(f"Loading of receipts failed. Will retry!")
            continue

        # Inspect each row for errors
        for row in batch:
            receipt = receipts.get(row['ticket_id'])
            if receipt is None:
                continue
            if receipt['status'] == 'error':
                message = receipt['details']['error']
                print(f"Error sending notification to {row['push_token']}: {message}")
                if message == 'DeviceNotRegistered':
                    print("DELETE FROM POSSIBLE DEVICES")

async def check_for_receipts(client : MongoClient):
    while True:
        await asyncio.sleep(60)
        entries = await retrieve_push_notifications(
            datetime.now() - timedelta(minutes = 15),
            client
        )

        if entries:
            await retrieve_receipts(entries)


       