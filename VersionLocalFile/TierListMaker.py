import requests
import asyncio
import webbrowser
import json

async def requestFromURL(url,List):
    payload = {}
    headers = {
    'X-MAL-CLIENT-ID': 'eb339a2b69f882e46439a64f8d89feb3'
    }
    try:
        response = requests.request("GET", url, headers=headers, data=payload)
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        raise SystemExit(err)
    response=response.json()
    if 'next' in response['paging']:
        return(await requestFromURL(response['paging']['next'],List+response['data']))
    else:
        return(List+response['data'])



async def GetList(name):
    List=[]
    url = "https://api.myanimelist.net/v2/users/"+name+"/animelist?status=completed&sort=list_score&fields=list_status&limit=1000"
    UserList=await requestFromURL(url,List)
    return UserList
name=input('Name of the account : ')
#création de la liste 
list= asyncio.run( GetList(name))

#sauvegarde de la liste en javascript
var = "var LIST_DATA = "
with open('list_data.js', 'w') as outfile:
    outfile.write(var)
    # Write the JSON value here
    outfile.write(json.dumps(list))
    
#ouverture du html qui utilise la liste
webbrowser.open_new_tab('TierListWLocalFile.html')