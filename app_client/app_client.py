#!/usr/bin/env python
# app_client.py
# Copyright (C) ContinuumBridge Limited, 2015 - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Peter Claydon
#
"""
Just stick actions from incoming requests into threads.
"""

import json
import requests
import time
import sys
import os.path
import signal
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.MIMEImage import MIMEImage
import logging
import logging.handlers
import twilio
import twilio.rest
from autobahn.twisted.websocket import WebSocketClientFactory, WebSocketClientProtocol, connectWS
from twisted.internet import threads
from twisted.internet import reactor, defer
from twisted.internet import task
from twisted.internet.protocol import ReconnectingClientFactory

config                = {}
buttons               = []
buttonStates          = {}
HOME                  = os.getcwd()
CONFIG_FILE           = HOME + "/app_client.config"
CB_LOGFILE            = HOME + "/app_client.log"
CB_ADDRESS            = "portal.continuumbridge.com"
CB_LOGGING_LEVEL      = "DEBUG"
CONFIG_READ_INTERVAL  = 10.0
WATCHDOG_TIME         = 2000     # If not heard about a button for this time, consider it disconnected
MONITOR_INTERVAL      = 60       # How often to run watchdog code
SSID_LOOKUP           = [-89, -85, -80, -75, -65]
 
logger = logging.getLogger('Logger')
logger.setLevel(CB_LOGGING_LEVEL)
handler = logging.handlers.RotatingFileHandler(CB_LOGFILE, maxBytes=10000000, backupCount=5)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def nicetime(timeStamp):
    localtime = time.localtime(timeStamp)
    milliseconds = '%03d' % int((timeStamp - int(timeStamp)) * 1000)
    now = time.strftime('%H:%M:%S, %d-%m-%Y', localtime)
    return now

def sendMail(to, subject, body):
    try:
        user = config["mail"]["user"]
        password = config["mail"]["password"]
        # Create message container - the correct MIME type is multipart/alternative.
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = config["mail"]["from"]
        recipients = to.split(',')
        [p.strip(' ') for p in recipients]
        if len(recipients) == 1:
            msg['To'] = to
        else:
            msg['To'] = ", ".join(recipients)
        # Create the body of the message (a plain-text and an HTML version).
        text = body + " \n"
        htmlText = text
        # Record the MIME types of both parts - text/plain and text/html.
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(htmlText, 'html')
        msg.attach(part1)
        msg.attach(part2)
        mail = smtplib.SMTP('smtp.gmail.com', 587)
        mail.ehlo()
        mail.starttls()
        mail.login(user, password)
        mail.sendmail(user, recipients, msg.as_string())
        logger.debug("Sent mail")
        mail.quit()
    except Exception as ex:
        logger.warning("sendMail problem. To: %s, type %s, exception: %s", to, type(ex), str(ex.args))
       
def postData(dat, bid):
    try:
        url = ""
        for b in config["bridges"]:
            if b["bid"] == bid:
                if "database" in b:
                    url = config["dburl"] + "db/" + b["database"] + "/series?u=root&p=" + config["dbrootp"]
                else:
                    url = config["dburl"] + "db/Bridges/series?u=root&p=27ff25609da60f2d"
                break
        headers = {'Content-Type': 'application/json'}
        status = 0
        logger.debug("url: %s", url)
        r = requests.post(url, data=json.dumps(dat), headers=headers)
        status = r.status_code
        if status !=200:
            logger.warning("POSTing failed, status: %s", status)
    except Exception as ex:
        logger.warning("postData problem, type %s, exception: %s", to, type(ex), str(ex.args))

def sendSMS(messageBody, to):
    numbers = to.split(",")
    for n in numbers:
       try:
           client = twilio.rest.TwilioRestClient(config["twilio_account_sid"], config["twilio_auth_token"])
           message = client.messages.create(
               body = messageBody,
               to = n,
               from_ = config["twilio_phone_number"]
           )
           sid = message.sid
           logger.debug("Sent sms: %s", str(n))
       except Exception as ex:
           logger.warning("sendSMS, unable to send message %s to: %s, type %s, exception: %s", messageBody, str(to), type(ex), str(ex.args))

def authorise():
    if True:
    #try:
        auth_url = "http://" + CB_ADDRESS + "/api/client/v1/client_auth/login/"
        auth_data = '{"key": "' + config["cid_key"] + '"}'
        auth_headers = {'content-type': 'application/json'}
        response = requests.post(auth_url, data=auth_data, headers=auth_headers)
        cbid = json.loads(response.text)['cbid']
        sessionID = response.cookies['sessionid']
        ws_url = "ws://" + CB_ADDRESS + ":7522/"
        return cbid, sessionID, ws_url
    #except Exception as ex:
    #    logger.warning("Unable to authorise with server, type: %s, exception: %s", str(type(ex)), str(ex.args))
    
def readConfig(forceRead=False):
    if True:
    #try:
        global config
        oldconfig = config
        if time.time() - os.path.getmtime(CONFIG_FILE) < 600 or forceRead:
            with open(CONFIG_FILE, 'r') as f:
                newConfig = json.load(f)
                logger.info( "Read button_client.config")
                config.update(newConfig)
                logger.info("Config read")
            for c in config:
                if c.lower in ("true", "t", "1"):
                    config[c] = True
                elif c.lower in ("false", "f", "0"):
                    config[c] = False
            #logger.info("Read new config: " + json.dumps(config, indent=4))
            if config != oldconfig:
                return True
            else:
                return False
    #except Exception as ex:
    #    logger.warning("Problem reading button_client.config, type: %s, exception: %s", str(type(ex)), str(ex.args))
        return False

def postButtonStatus(state, signal, bridge, id):
    try:
        status = {
            "$set": {
                 "state": state,
                 "signal": signal,
                 "bridge": bridge
            }
        }
        headers = {"X-Auth-Token": config["buttonsKey"], 'Content-Type': 'application/json'}
        r = requests.put(config["buttonsURL"] + id, data=json.dumps(status), headers=headers)
        logger.debug("Posted, response: %s, status_code: %s", r.text, r.status_code)
    except Exception as ex:
        logger.warning("postButtonStatus. Unable to post , type: %s, exception: %s", str(type(ex)), str(ex.args))

def createButton(id, state):
    buttonStates[id] = {
        "reported": {
            "state": state,
            "timeStamp": time.time(),
            "connected": False,
            "signal": 0
        }
    }

def getButtons():
    global buttons
    try:
        #logger.debug("getButtons")
        headers = {"X-Auth-Token": config["buttonsKey"]}
        r = requests.get(config["buttonsURL"], headers=headers)
        buttons = json.loads(r.content)
        for b in buttons:
            if b["id"] not in buttonStates:
                if b["enabled"]:
                    createButton(b["id"], "Waiting")
                    reactor.callInThread(postButtonStatus, "Waiting", "0", "", b["_id"])
                else:
                    createButton(b["id"], "Disabled")
                    reactor.callInThread(postButtonStatus, "Disabled", "0", "", b["_id"])
            elif not b["enabled"] and buttonStates[b["id"]]["reported"]["state"] != "Disabled":
                buttonStates[b["id"]]["reported"]["state"] = "Disabled"
                reactor.callInThread(postButtonStatus, "Disabled", "0", "", b["_id"])
            elif b["enabled"] and buttonStates[b["id"]]["reported"]["state"] == "Disabled":
                buttonStates[b["id"]]["reported"]["state"] = "Waiting"
                reactor.callInThread(postButtonStatus, "Waiting", "0", "", b["_id"])
        #logger.debug("buttons: %s", json.dumps(buttons, indent=4))
    except Exception as ex:
        logger.warning("getButton problem, type: %s, exception: %s", str(type(ex)), str(ex.args))

def ssidToNumber(ssid):
    for s in SSID_LOOKUP:
        if ssid < s:
            return SSID_LOOKUP.index(s) + 1
            break
    return 5

class ClientWSFactory(ReconnectingClientFactory, WebSocketClientFactory):
    maxDelay = 60
    maxRetries = 200
    def startedConnecting(self, connector):
        logger.debug('Started to connect.')
        ReconnectingClientFactory.resetDelay

    def clientConnectionLost(self, connector, reason):
        logger.debug('Lost connection. Reason: %s', reason)
        ReconnectingClientFactory.clientConnectionLost(self, connector, reason)

    def clientConnectionFailed(self, connector, reason):
        logger.debug('Lost reason. Reason: %s', reason)
        ReconnectingClientFactory.clientConnectionFailed(self, connector, reason)

class ClientWSProtocol(WebSocketClientProtocol):
    def __init__(self):
        logger.debug("Connection __init__")
        signal.signal(signal.SIGINT, self.signalHandler)  # For catching SIGINT
        signal.signal(signal.SIGTERM, self.signalHandler)  # For catching SIGTERM
        self.stopping = False
        self.foundButton = False
        self.connectedBridges = []
    	self.readConfigLoop()
        l1 = task.LoopingCall(self.readConfigLoop)
        l1.start(CONFIG_READ_INTERVAL)
        l2 = task.LoopingCall(self.monitor)
        l2.start(MONITOR_INTERVAL)

    def signalHandler(self, signal, frame):
        logger.debug("signalHandler received signal")
        self.stopping = True
        reactor.stop()

    def readConfigLoop(self):
        #logger.debug("readConfigLoop")
        if readConfig(True):
            self.updateUUIDs()
        getButtons()

    def sendToBridge(self, message):
        self.sendMessage(json.dumps(message))

    def onConnect(self, response):
        logger.debug("Server connected: %s", str(response.peer))

    def onOpen(self):
        logger.debug("WebSocket connection open.")

    def onClose(self, wasClean, code, reason):
        logger.debug("onClose, reason:: %s", reason)

    def onMessage(self, message, isBinary):
        logger.debug("onMessage")
        try:
            msg = json.loads(message)
            logger.info("Message received: %s", json.dumps(msg, indent=4))
        except Exception as ex:
            logger.warning("onmessage. Unable to load json, type: %s, exception: %s", str(type(ex)), str(ex.args))
        if not "source" in msg:
            logger.warning("button_client. onmessage. message without source")
            return
        if not "body" in msg:
            logger.warning("button_client. onmessage. message without body")
            return
        if msg["body"] == "connected":
            logger.info("Connected to ContinuumBridge")
        else:
            bid = msg["source"].split("/")[0]
            logger.debug("onMessage, bid: " + str(bid) + ", config_bridges: " + str(config["bridges"]))
            if bid not in config["bridges"]:
                return
            found = False
            for body in msg["body"]:
                rx_n = 0
                if "n" in body:
                    found = True
                    if rx_n <= body["n"]:
                        rx_n = body["n"]
                        del body["n"]
                self.processBody(body, bid)
            if found:
                ack = {
                        "source": config["cid"],
                        "destination": msg["source"],
                        "body": [
                                    {"a": rx_n}
                                ]
                      }
                logger.debug("onMessage ack: %s", str(json.dumps(ack, indent=4)))
                reactor.callInThread(self.sendToBridge, ack)

    def processBody(self, body, bid):
        if True:
        #try:
            logger.debug("body: %s", str(body))
            self.foundButton = True
            if "a" not in body:  # "a" is an ack message
                if "status" in body:
                    if bid not in config["bridges"]:
                        logger.warning("Unknown bridge trying to initialise: %s", bid)
                    else:
                        if bid not in self.connectedBridges:
                            self.initBridge(bid)
                            logger.info("New bridge: %s, connectedBridges: %s", bid, self.connectedBridges)
                    return
                for b in buttons:
                    if str(body["b"]) == b["id"]:
                        if b["enabled"]:
                            changed = None
                            if "c" in body:  # "c" should always be in the body
                                if b["id"] in buttonStates:  # Already have record of button
                                    if bid in buttonStates[b["id"]]:
                                        if body["c"] != buttonStates[b["id"]][bid]["connected"]:
                                                buttonStates[b["id"]][bid]["connected"] = body["c"]
                                                changed = bid
                                    else:  # Button not seen by bridge bid before, create entry
                                        buttonStates[b["id"]][bid] = {
                                            "connected": body["c"],
                                            "state": "OK",
                                            "signal": 0
                                        }
                                        changed = bid
                                else:  # New button, create entry in dict
                                    createButton(b["id"], "OK")
                                    buttonStates[b["id"]][bid] = {
                                        "connected": body["c"],
                                        "state": "OK",
                                        "signal": 0
                                    }
                                    changed = bid
                                buttonStates[b["id"]][bid]["timeStamp"] = time.time()
                                buttonStates[b["id"]][bid]["niceTime"] = nicetime(time.time())
                            if "s" in body:
                                buttonStates[b["id"]][bid]["state"] = "Pressed" if body["s"] == 1 else "OK"
                                changed = bid
                                if buttonStates[b["id"]][bid]["state"] == "Pressed" and buttonStates[b["id"]]["reported"]["state"] == "OK" or \
                                    buttonStates[b["id"]][bid]["state"] == "OK" and buttonStates[b["id"]]["reported"]["state"] == "Pressed":
                                    buttonStates[b["id"]]["reported"]["state"] = buttonStates[b["id"]][bid]["state"]
                                    alert = b["name"] + (" pressed" if buttonStates[b["id"]]["reported"]["state"] == "Pressed" else " cleared")
                                    if "email" in b:
                                        if b["email"] != "":
                                            subject = alert + " at " +  nicetime(time.time())
                                            reactor.callInThread(sendMail, b["email"], subject, alert)
                                    if "sms" in b:
                                        if b["sms"] != "":
                                            reactor.callInThread(sendSMS, alert, b["sms"])
                                elif buttonStates[b["id"]]["reported"]["state"] != "Pressed" and buttonStates[b["id"]]["reported"]["state"] != "OK":
                                    buttonStates[b["id"]]["reported"]["state"] = buttonStates[b["id"]][bid]["state"]
                            if "p" in body:
                                signal = ssidToNumber(body["p"]) 
                                if signal != buttonStates[b["id"]][bid]["signal"]:
                                    buttonStates[b["id"]][bid]["signal"] = signal
                                    changed = bid
                            if changed:
                                logger.debug("changed button: %s, bridge: %s", b["id"], str(changed))
                                logger.debug("State changed: %s", str(json.dumps(buttonStates[b["id"]], indent=4)))
                                self.updateDisplay(b)
                        break
        #except Exception as ex:
        #    logger.warning("onmessage. Problem processing message body, type: %s, exception: %s", str(type(ex)), str(ex.args))

    def monitor(self):
        logger.debug("monitor")
        if self.foundButton:  # Don't do anything unless we know about at least one button
            now = time.time()
            bridgeList = []
            for b in buttons:
                changed = False
                if b["enabled"]:
                    if b["id"] in buttonStates:
                        #logger.debug("monitor, b_id in buttonState: %s", buttonStates[b["id"]])
                        if buttonStates[b["id"]]["reported"]["state"] != "Disconnected":
                            connected = False
                            for bridge in buttonStates[b["id"]]:
                                if bridge != "reported":
                                    if now - buttonStates[b["id"]][bridge]["timeStamp"] < WATCHDOG_TIME:
                                        connected = True
                                    else:
                                        buttonStates[b["id"]][bridge]["connected"] = False
                                        buttonStates[b["id"]][bridge]["state"] = "Disconnected"
                                        buttonStates[b["id"]][bridge]["signal"] = 0
                                        bridgeList.append(bridge)
                                        changed = True
                                        logger.debug("Bridge %s not seen for WATCHDOG_TIME", bridge)
                            if not connected:
                                changed = True
                                buttonStates[b["id"]]["reported"]["state"] = "Disconnected"
                elif b["id"] in buttonStates: 
                    if buttonStates[b["id"]]["reported"]["state"] != "Disabled":
                        buttonStates[b["id"]]["reported"]["state"] = "Disabled"
                        changed = True
                if changed:
                    logger.debug("monitor, button %s not connected", b["id"])
                    self.updateDisplay(b)
                disconnect = []
                for bridge in self.connectedBridges:
                    if bridge not in bridgeList:
                        disconnect.append(bridge) 
                for d in disconnect:
                    logger.debug("d in disconnect: %s", d)
                    self.connectedBridges.remove(d)

    def updateDisplay(self, b):
        logger.debug("updateDisplay")
        loudestBridge = None
        connected = False
        signal = 0
        for bridge in buttonStates[b["id"]]:
            if buttonStates[b["id"]][bridge]["connected"]:
                connected = True
            	if buttonStates[b["id"]][bridge]["signal"] > signal:
                    signal = buttonStates[b["id"]][bridge]["signal"]
                    loudestBridge = bridge
        if not connected:
             buttonStates[b["id"]]["reported"]["state"] = "No signal"
        state = buttonStates[b["id"]]["reported"]["state"]
        bridge = loudestBridge
        reactor.callInThread(postButtonStatus, state, signal, bridge, b["_id"])

    def initBridge(self, bid):
        self.connectedBridges.append(bid)
        msg = {
        "source": config["cid"],
        "destination": bid + "/" + config["aid"],
        "body": [
                    {"uuids": config["uuids"]}
                ]
        }
        logger.debug("initBridge, sending: %s", msg)
        self.sendToBridge(msg)

    def updateUUIDs(self):
        for bridge in self.connectedBridges:
            reactor.callInThread(self.initBridge, bridge)

if __name__ == '__main__':
    readConfig(True)
    getButtons()
    cbid, sessionID, ws_url = authorise()
    headers = {'sessionID': sessionID}
    factory = ClientWSFactory(ws_url, headers=headers, debug=False)
    factory.protocol = ClientWSProtocol
    connectWS(factory)
    reactor.run()
