import requests
from qb.models import QuickBooksToken

token = QuickBooksToken.objects.first()

url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"

headers = {
    "Authorization": f"Bearer {token.access_token}",
    "Accept": "application/json",
}

params = {
    "query": "select Id, Name, QtyOnHand from Item"
}

response = requests.get(url, headers=headers, params=params)
response.raise_for_status()

items = response.json()["QueryResponse"].get("Item", [])

for i in items:
    print(f"ID: {i['Id']} | Name: {i['Name']} | Stock: {i.get('QtyOnHand')}")




################Refresh Token QuickBooks con shell de pyton copiar y pegar #############
exec("""
import requests
from django.conf import settings
from qb.models import QuickBooksToken

def refresh_qb_token():
    token = QuickBooksToken.objects.first()

    url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"

    data = {
        "grant_type": "refresh_token",
        "refresh_token": token.refresh_token,
    }

    response = requests.post(
        url,
        data=data,
        auth=(settings.QB_CLIENT_ID, settings.QB_CLIENT_SECRET),
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }
    )

    response.raise_for_status()
    data = response.json()

    token.access_token = data["access_token"]
    token.refresh_token = data["refresh_token"]
    token.save()

    return token
""")
################Refresh Token QuickBooks con shell de pyton copiar y pegar ############################
#token = refresh_qb_token()
#print("✅ Token refrescado")
################consultar id item QuickBooks con shell de pyton copiar y pegar #########################
url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{token.realm_id}/query"

headers = {
    "Authorization": f"Bearer {token.access_token}",
    "Accept": "application/json",
}

params = {
    "query": "SELECT Id, Name, QtyOnHand FROM Item"
}

response = requests.get(url, headers=headers, params=params)
response.raise_for_status()

items = response.json()["QueryResponse"].get("Item", [])

for i in items:
    print(f"ID: {i['Id']} | Name: {i['Name']} | Stock: {i.get('QtyOnHand')}")
