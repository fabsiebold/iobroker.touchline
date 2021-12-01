#!/usr/bin/env python

__author__      = "Lars-Georg S. Paulsen"
__copyright__   = "Copyright 2016, dev.n0ll.com"
__license__     = "GPL"
__version__     = "0.1"
__email__       = "lars.georg.paulsen@gmail.com"
__status__      = "Development"
__webpage__     = "https://dev.n0ll.com/roth-touchline/"

## Import 
import argparse
import requests
import json
from lxml import etree
from prettytable import PrettyTable ## Only need if you want pretty output in status

## Setting Option arguments
parser = argparse.ArgumentParser(description='Python ROTH Touchline script')
parser.add_argument('-t','--target', help='ip/dns name of touchline device',required=True)
parser.add_argument('-m','--mode',help='Read/Write mode ', required=False)
parser.add_argument('-i','--id',help='EndPoint #', required=False)
parser.add_argument('-n','--name',help='Endpoint Name', required=False)
parser.add_argument('-v','--value',help='Value ', required=False)
args = parser.parse_args()
 
## Define global variables ##
host=args.target
headers = {'Content-Type': 'text/xml', 'User-Agent': 'Roth-Touchline.../1.05'} # Basic Headers needed :)

def read():
    x = args.id
    data = '<body><version>1.0</version><client>App</client><file_name>Controller</file_name><item_list_size>13</item_list_size><item_list><i><n>G'+x+'.kurzID</n></i><i><n>G'+x+'.ownerKurzID</n></i><i><n>G'+x+'.RaumTemp</n></i><i><n>G'+x+'.SollTemp</n></i><i><n>G'+x+'.OPMode</n></i><i><n>G'+x+'.WeekProg</n></i><i><n>G'+x+'.TempSIUnit</n></i><i><n>G'+x+'.SollTempMaxVal</n></i><i><n>G'+x+'.SollTempMinVal</n></i><i><n>G'+x+'.SollTempStepVal</n></i><i><n>G'+x+'.OPModeEna</n></i><i><n>G'+x+'.WeekProgEna</n></i><i><n>CD.rooms['+x+']</n></i></item_list></body>'
    xml=requests.post('http://'+host+'/cgi-bin/ILRReadValues.cgi', data=data, headers=headers).text
    r = etree.fromstring(xml)
    print(r.xpath('//i[n[text()="G'+args.id+'.'+args.name+'"]]/v/text()')[0])

def write():
    payload = {'G'+args.id+'.'+args.name: args.value}
    repons = requests.get('http://'+host+'/cgi-bin/writeVal.cgi', params=payload)
    print(repons.text)

def getcount():
   ## Get how many endpoints we can controll
   data = """ <body><version>1.0</version><item_list_size>1</item_list_size><item_list><i><n>totalNumberOfDevices</n></i></item_list></body> """
   xml=requests.post('http://'+host+'/cgi-bin/ILRReadValues.cgi', data=data, headers=headers).text
   respons = etree.fromstring(xml)
#   print xml 
   numbers = respons.find('item_list/i/v')
   return int( numbers.text)

    
def status():
   jsonCompleteStr = {}
   jsonCompleteStr["Name"] = "ROTH Touchline"
   jsonCompleteStr["NumberOfDevices"] = 0
   jsonCompleteStr["Devices"] = []

#   print jsonCompleteStr["Devices"][0]
   jsonDevStr = {}
   numbers = getcount()
   ## Defining pretty table
   status = PrettyTable(["#", "Room", "Current Temp", "Target Temp", "OPMode"])
   status.align['Room'] = "l"
   ## Loop through endpoints and get stats.
#   print("Getting data from endpoints...")
   for x in range(0,numbers):
      x = str(x) ## concatenate 
      ## Define xml post statment
      room = '<body><version>1.0</version><client>App</client><file_name>Controller</file_name><item_list_size>13</item_list_size><item_list><i><n>G'+x+'.kurzID</n></i><i><n>G'+x+'.ownerKurzID</n></i><i><n>G'+x+'.RaumTemp</n></i><i><n>G'+x+'.SollTemp</n></i><i><n>G'+x+'.OPMode</n></i><i><n>G'+x+'.WeekProg</n></i><i><n>G'+x+'.TempSIUnit</n></i><i><n>G'+x+'.SollTempMaxVal</n></i><i><n>G'+x+'.SollTempMinVal</n></i><i><n>G'+x+'.SollTempStepVal</n></i><i><n>G'+x+'.OPModeEna</n></i><i><n>G'+x+'.WeekProgEna</n></i><i><n>CD.rooms['+x+']</n></i></item_list></body>'
      ## Send request and parse xml 
      xml=requests.post('http://'+host+'/cgi-bin/ILRReadValues.cgi', data=room, headers=headers).text
      r = etree.fromstring(xml)
 
      ## Collection values for room X
      ## Search for <n> tag, check parent for <v> and get value, only one value get first element
      RaumName        = r.xpath('//i[n[text()="CD.rooms['+x+']"]]/v/text()')[0]
      OPMode          = r.xpath('//i[n[text()="G'+x+'.OPMode"]]/v/text()')[0]
      SollTemp        = r.xpath('//i[n[text()="G'+x+'.SollTemp"]]/v/text()')[0]
      RaumTemp        = r.xpath('//i[n[text()="G'+x+'.RaumTemp"]]/v/text()')[0]
      kurzID          = r.xpath('//i[n[text()="G'+x+'.kurzID"]]/v/text()')[0]
      ownerKurzID     = r.xpath('//i[n[text()="G'+x+'.ownerKurzID"]]/v/text()')[0]
      WeekProg        = r.xpath('//i[n[text()="G'+x+'.WeekProg"]]/v/text()')[0]
      TempSIUnit      = r.xpath('//i[n[text()="G'+x+'.TempSIUnit"]]/v/text()')[0]
      SollTempMaxVal  = r.xpath('//i[n[text()="G'+x+'.SollTempMaxVal"]]/v/text()')[0]
      SollTempMinVal  = r.xpath('//i[n[text()="G'+x+'.SollTempMinVal"]]/v/text()')[0]
      SollTempStepVal = r.xpath('//i[n[text()="G'+x+'.SollTempStepVal"]]/v/text()')[0]
      OPModeEna       = r.xpath('//i[n[text()="G'+x+'.OPModeEna"]]/v/text()')[0]
      WeekProgEna     = r.xpath('//i[n[text()="G'+x+'.WeekProgEna"]]/v/text()')[0]
      
      ## Cleaning up Temp 
      SollTemp = round(float(SollTemp)/100,1)
      RaumTemp = round(float(RaumTemp)/100,1)
      SollTempMaxVal  = round(float(SollTempMaxVal)/100,1)
      SollTempMinVal  = round(float(SollTempMinVal)/100,1)
      SollTempStepVal = round(float(SollTempStepVal)/100,1)

      ## Mode fix
#      if OPMode == "0":
#         OPMode = "Normal"
#      elif OPMode == "1":
#         OPMode = "Night"
#      elif OPMode == "2":
#         OPMode = "Holliday"

      ## WeekProg fix
#      if WeekProg == "0":
#         WeekProg = "Aus"
#      elif WeekProg == "1":
#         WeekProg = "Programm 1"
#      elif WeekProg == "2":
#         WeekProg = "Programm 2"
#      elif WeekProg == "2":
#         WeekProg = "Programm 3"

      ## Cleaning up enables
      OPModeEna   = (OPModeEna == "1")
      WeekProgEna = (WeekProgEna == "1")

	  ## Cleaning up unit
      if TempSIUnit == "0":
         TempSIUnit = "C"
      else:
         TempSIUnit = ""


      # Suche das Device
      iDev = 0
      found = False
      jsonDevStr = {}

#      print json.dumps(jsonCompleteStr, indent=4)
      for dev in jsonCompleteStr["Devices"]:
         if dev["Id"] == ownerKurzID:
            found = True
            break
         iDev += 1 

      # Lege es an, wenn es nicht gefunden wurde
      if found == False:
         jsonDevStr = {}
         jsonDevStr["Id"] = ownerKurzID
         jsonDevStr["RoomUnits"] = []
         jsonDevStr["NumberOfRoomUnits"] = 0
         # Lege das Device an und inkrementiere die Anzahl der Devices
         jsonCompleteStr["Devices"].append(jsonDevStr)
         jsonCompleteStr["NumberOfDevices"] += 1
	  
      # Inkrementiere die Anzahl der RUs
      jsonCompleteStr["Devices"][iDev]["NumberOfRoomUnits"] += 1
			
	  
#   jsonCompleteStr["Devices"].append(jsonDevStr)
#   jsonDevStr = {}
#   jsonDevStr["DeviceId"] = "66"
#   jsonDevStr["RoomUnits"] = []
#   jsonCompleteStr["Devices"].append(jsonDevStr)
#   for dev in jsonCompleteStr["Devices"]:
#      if dev["DeviceId"] == "99":
#         print "FOUND 99 on pos" + json.dumps(dev, indent=4)
#         dev["RoomUnits"].append({"HALLO": "BIN DA"})
#      if dev["DeviceId"] == "66":
#         print "FOUND 66 on pos" + json.dumps(dev, indent=4)
#         dev["RoomUnits"].append({"HALLO": "BIN AUCH DA"})

#   print json.dumps(jsonCompleteStr, indent=4)
   
#   return

      jsonStr = {}
      jsonStr["Id"] = x
      jsonStr["KurzId"] = kurzID
      jsonStr["DevAddress"] = "G" + x 
      jsonStr["Name"] = RaumName
      jsonStr["RaumTemp"] = RaumTemp
      jsonStr["SollTemp"] = SollTemp
      jsonStr["OPMode"] = OPMode
      jsonStr["WeekProg"] = WeekProg
      jsonStr["TempSIUnit"] = TempSIUnit
      jsonStr["SollTempMaxVal"] = SollTempMaxVal
      jsonStr["SollTempMinVal"] = SollTempMinVal
      jsonStr["SollTempStepVal"] = SollTempStepVal
      jsonStr["OPModeEna"] = OPModeEna
      jsonStr["WeekProgEna"] = WeekProgEna
	  
      jsonCompleteStr["Devices"][iDev]["RoomUnits"].append(jsonStr)
	  
      ## Add values to PrettyTable
      status.add_row([x,RaumName,RaumTemp,SollTemp,OPMode])
#   print(status)
   print(json.dumps(jsonCompleteStr, indent=4, separators=(',', ': ')))


if args.mode == "read":
    read()
elif args.mode == "write":
    write()
else:
    status()
