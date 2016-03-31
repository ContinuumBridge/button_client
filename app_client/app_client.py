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
from twisted.internet.protocol import ReconnectingClientFactory

config                = {}
buttons               = []
HOME                  = os.path.expanduser("~")
CONFIG_FILE           = HOME + "/button_client/app_client/app_client.config"
CB_LOGFILE            = HOME + "/button_client_files/app_client.log"
CB_ADDRESS            = "portal.continuumbridge.com"
CB_LOGGING_LEVEL      = "DEBUG"
CONFIG_READ_INTERVAL  = 10.0
SSID_LOOKUP           = [-86, -83, -80, -77, -65]
 
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
    try:
        auth_url = "http://" + CB_ADDRESS + "/api/client/v1/client_auth/login/"
        auth_data = '{"key": "' + config["cid_key"] + '"}'
        auth_headers = {'content-type': 'application/json'}
        response = requests.post(auth_url, data=auth_data, headers=auth_headers)
        cbid = json.loads(response.text)['cbid']
        sessionID = response.cookies['sessionid']
        ws_url = "ws://" + CB_ADDRESS + ":7522/"
        return cbid, sessionID, ws_url
    except Exception as ex:
        logger.warning("Unable to authorise with server, type: %s, exception: %s", str(type(ex)), str(ex.args))
    
def readConfig(forceRead=False):
    try:
        if time.time() - os.path.getmtime(CONFIG_FILE) < 600 or forceRead:
            global config
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
    except Exception as ex:
        logger.warning("Problem reading button_client.config, type: %s, exception: %s", str(type(ex)), str(ex.args))

def postButtonStatus(status, id):
    headers = {"X-Auth-Token": config["buttonsKey"], 'Content-Type': 'application/json'}
    r = requests.put(config["buttonsURL"] + id, data=json.dumps(status), headers=headers)
    logger.debug("Posted, response: %s, status_code: %s", r.text, r.status_code)

def getButtons():
    global buttons
    try:
        #logger.debug("getButtons")
        headers = {"X-Auth-Token": config["buttonsKey"]}
        r = requests.get(config["buttonsURL"], headers=headers)
        buttons = json.loads(r.content)
        #logger.debug("buttons: %s", json.dumps(buttons, indent=4))
    except Exception as ex:
        logger.warning("getButton problem, type: %s, exception: %s", str(type(ex)), str(ex.args))

def readConfigLoop():
    #logger.debug("readConfigLoop")
    readConfig(True)
    getButtons()
    configLoop = reactor.callLater(CONFIG_READ_INTERVAL, readConfigLoop)

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
        self.buttonStates = {}
        self.reconnects = 0
        self.reauthorise = 0
        self.sendCount = 0

    def signalHandler(self, signal, frame):
        logger.debug("signalHandler received signal")
        self.stopping = True
        reactor.stop()

    def sendAck(self, ack):
        self.sendMessage(json.dumps(ack))

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
                reactor.callInThread(self.sendAck, ack)

    def processBody(self, body, bid):
        if True:
        #try:
            logger.debug("body: %s", str(body))
            if "a" not in body:  # "a" is an ack message
                for b in buttons:
                    logger.debug("onMessage for b in buttons, b: %s, body[b]: %s", str(b), str(body["b"]))
                    if str(body["b"]) == b["id"]:
                        if b["enabled"]:
                            changed = None
                            if "c" in body:  # "c" should always be in the body
                                if b["id"] in self.buttonStates:  # Already have record of button
                                    if bid in self.buttonStates[b["id"]]:
                                        if body["c"] != self.buttonStates[b["id"]][bid]["connected"]:
                                                self.buttonStates[b["id"]][bid]["connected"] = body["c"]
                                                self.buttonStates[b["id"]][bid]["timeStamp"] = time.time()
                                                self.buttonStates[b["id"]][bid]["niceTime"] = nicetime(time.time())
                                                changed = bid
                                    else:  # Button not seen by bridge bid before, create entry
                                        self.buttonStates[b["id"]][bid] = {
                                            "connected": body["c"],
                                            "state": "cleared",
                                            "timeStamp": time.time(),
                                            "niceTime":  nicetime(time.time()),
                                            "signal": 0
                                        }
                                        changed = bid
                                else:  # New button, create entry in dict
                                    self.buttonStates[b["id"]] = {}
                                    self.buttonStates[b["id"]][bid] = {
                                        "connected": body["c"],
                                        "state": "cleared",
                                        "timeStamp": time.time(),
                                        "niceTime":  nicetime(time.time()),
                                        "signal": 0
                                    }
                                    changed = bid
                            if "s" in body:
                                if body["s"] == 1:
                                    alert = b["name"] + " pressed"
                                    self.buttonStates[b["id"]][bid]["state"] = "pressed"
                                elif body["s"] == 0:
                                    alert = b["name"] + " cleared"
                                    self.buttonStates[b["id"]][bid]["state"] = "cleared"
                                if "email" in b:
                                    if b["email"] != "":
                                        subject = alert + " at " +  nicetime(time.time())
                                        reactor.callInThread(sendMail, b["email"], subject, alert)
                                if "sms" in b:
                                    if b["sms"] != "":
                                        reactor.callInThread(sendSMS, alert, b["sms"])
                                changed = bid
                            if "p" in body:
                                signal = ssidToNumber(body["p"]) 
                                if signal != self.buttonStates[b["id"]][bid]["signal"]:
                                    self.buttonStates[b["id"]][bid]["signal"] = signal
                                    changed = bid
                            if changed:
                                logger.debug("changed bridge: " + str(changed))
                                logger.debug("State changed: %s", str(json.dumps(self.buttonStates, indent=4)))
                                signal = -200
                                loudestBridge = None
                                connected = False
                                for bridge in self.buttonStates[b["id"]]:
                                    if self.buttonStates[b["id"]][bridge]["signal"] > signal:
                                        signal = self.buttonStates[b["id"]][bridge]["signal"]
                                        loudestBridge = bridge
                                    if self.buttonStates[b["id"]][bridge]["connected"]:
                                        connected = True
                                state = self.buttonStates[b["id"]][changed]["state"]
                                status = {
                                    "$set": {
                                        "state": "No signal" if not connected else state,
                                        "signal": signal,
                                        "bridge": loudestBridge
                                    }
                                }
                                logger.debug("Posting: %s", str(json.dumps(status, indent=4)))
                                reactor.callInThread(postButtonStatus, status, b["_id"])
                        break
        #except Exception as ex:
        #    logger.warning("onmessage. Problem processing message body, type: %s, exception: %s", str(type(ex)), str(ex.args))

    """
    def monitor(self):
        now = time.time()
        for b in buttons:
            if b["enabled"]:
                for bridge in buttonStates[b["id"]]:
                    if now - buttonStates[b["id"]][bridge]["timeStamp"] > WATCHDOG_TIME:
    """

if __name__ == '__main__':
    readConfig(True)
    cbid, sessionID, ws_url = authorise()
    headers = {'sessionID': sessionID}
    factory = ClientWSFactory(ws_url, headers=headers, debug=False)
    factory.protocol = ClientWSProtocol
    connectWS(factory)
    configLoop = reactor.callLater(CONFIG_READ_INTERVAL, readConfigLoop)
    reactor.run()
