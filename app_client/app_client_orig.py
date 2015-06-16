#!/usr/bin/env python
# button_client.py
# Copyright (C) ContinuumBridge Limited, 2015 - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Peter Claydon
#
"""
Bit of a botch for now. Just stick actions from incoming requests into threads.
"""

import json
import requests
import websocket
import time
import sys
import signal
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.MIMEImage import MIMEImage
import subprocess
import logging
import logging.handlers
import twilio
import twilio.rest
from twisted.internet import threads
from twisted.internet import reactor, defer
from subprocess import check_output
import os.path

config                = {}
buttons               = []
HOME                  = os.path.expanduser("~")
CONFIG_FILE           = HOME + "/button_client.config"
CB_ADDRESS            = "portal.continuumbridge.com"
DBURL                 = "http://onepointtwentyone-horsebrokedown-1.c.influxdb.com:8086/"
CB_LOGGING_LEVEL      = "DEBUG"
CB_LOGFILE            = HOME + "/button_client.log"
TWILIO_ACCOUNT_SID    = "AC72bb42908df845e8a1996fee487215d8" 
TWILIO_AUTH_TOKEN     = "717534e8d9e704573e65df65f6f08d54"
TWILIO_PHONE_NUMBER   = "+441183241580"
CONFIG_READ_INTERVAL  = 10.0
 
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
                    url = DBURL + "db/" + b["database"] + "/series?u=root&p=27ff25609da60f2d"
                else:
                    url = DBURL + "db/Bridges/series?u=root&p=27ff25609da60f2d"
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
           client = twilio.rest.TwilioRestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
           message = client.messages.create(
               body = messageBody,
               to = n,
               from_ = TWILIO_PHONE_NUMBER
           )
           sid = message.sid
           logger.debug("Sent sms: %s", str(n))
       except Exception as ex:
           logger.warning("sendSMS, unable to send message %s to: %s, type %s, exception: %s", messageBody, str(to), type(ex), str(ex.args))

def postButtonStatus(status, id):
    headers = {"X-Auth-Token": config["buttonsKey"], 'Content-Type': 'application/json'}
    r = requests.put(config["buttonsURL"] + id, data=json.dumps(status), headers=headers)
    logger.debug("Posted, response: %s, status_code: %s", r.text, r.status_code)

def getButtons():
    global buttons
    logger.debug("getButtons")
    headers = {"X-Auth-Token": config["buttonsKey"]}
    r = requests.get(config["buttonsURL"], headers=headers)
    buttons = json.loads(r.content)
    logger.debug("buttons: %s", json.dumps(buttons, indent=4))

class Connection(object):
    def __init__(self):
        logger.debug("Connection __init__")
        signal.signal(signal.SIGINT, self.signalHandler)  # For catching SIGINT
        signal.signal(signal.SIGTERM, self.signalHandler)  # For catching SIGTERM
        self.stopping = False
        self.buttonStates = {}
        self.reconnects = 0
        self.reauthorise = 0
        self.sendCount = 0
        #self.readConfig(True)
        #getButtons()
        #self.configLoop = reactor.callLater(CONFIG_READ_INTERVAL, self.readConfigLoop)
        self.readConfigLoop()
        reactor.callLater(5, self.authorise)
        #reactor.addSystemEventTrigger('before', 'shutdown', self.tidyUp)
        reactor.run()

    def signalHandler(self, signal, frame):
        logger.debug("signalHandler received signal")
        self.stopping = True
        self.ws.close()
        reactor.stop()
        time.sleep(0.5)
        sys.exit(0)

    def tidyUp(self):
        self.configLoop.cancel()

    def readConfig(self, forceRead=False):
        logger.debug("Reading config")
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
                logger.info("Read new config: " + json.dumps(config, indent=4))
        except Exception as ex:
            logger.warning("Problem reading button_client.config, type: %s, exception: %s", str(type(ex)), str(ex.args))

    def readConfigLoop(self):
        logger.debug("readConfigLoop")
        self.readConfig(True)
        getButtons()
        self.configLoop = reactor.callLater(CONFIG_READ_INTERVAL, self.readConfigLoop)

    def authorise(self):
        try:
            self.reconnects = 0
            auth_url = "http://" + CB_ADDRESS + "/api/client/v1/client_auth/login/"
            auth_data = '{"key": "' + config["cid_key"] + '"}'
            logger.debug("auth_data: %s", auth_data)
            auth_headers = {'content-type': 'application/json'}
            response = requests.post(auth_url, data=auth_data, headers=auth_headers)
            self.cbid = json.loads(response.text)['cbid']
            self.sessionID = response.cookies['sessionid']
            self.ws_url = "ws://" + CB_ADDRESS + ":7522/"
            reactor.callLater(0.1, self.connect)
        except Exception as ex:
            logger.warning("Unable to authorise with server, type: %s, exception: %s", str(type(ex)), str(ex.args))

    def connect(self):
        try:
            #websocket.enableTrace(True)
            self.ws = websocket.WebSocketApp(
                            self.ws_url,
                            on_open   = self.onopen,
                            on_error = self.onerror,
                            on_close = self.onclose,
                            header = ['sessionID: {0}'.format(self.sessionID)],
                            on_message = self.onmessage)
            self.ws.run_forever()
        except Exception as ex:
            self.reconnects += 1
            logger.warning("Websocket connection failed, type: %s, exception: %s", str(type(ex)), str(ex.args))

    def onopen(self, ws):
        self.reconnects = 0
        logger.debug("on_open")

    def onclose(self, ws):
        if not self.stopping:
            if self.reconnects < 4:
                logger.debug("on_close. Attempting to reconnect.")
                reactor.callLater((self.reconnects+1)*5, self.connect)
            else:
                logger.error("Max number of reconnect tries exceeded. Reauthenticating.")
                reactor.callLater(5, self.authorise)

    def onerror(self, ws, error):
        logger.error("Error: %s", str(error))

    def sendAck(self, ack):
        self.ws.send(json.dumps(ack))

    def onmessage(self, ws, message):
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
            #logger.debug("body: %s", str(body))
            if "a" not in body:  # "a" is an ack message
                for b in buttons:
                    #logger.debug("onMessage for b in buttons, b: %s, body[b]: %s", str(b), str(body))
                    if str(body["b"]) == b["id"]:
                        if b["enabled"]:
                            changed = False
                            if "c" in body:
                                if b["id"] in self.buttonStates:
                                    if body["c"] != self.buttonStates[b["id"]]["connected"]:
                                        self.buttonStates[b["id"]]["connected"] = body["c"]
                                        changed = True
                                else:
                                    self.buttonStates[b["id"]] = {
                                        "connected": body["c"],
                                        "state": "inactive",
                                        "bid": bid,
                                        "ssid": 0
                                    }
                                    changed = True
                            if "s" in body:
                                if body["s"] == 1:
                                    alert = b["name"] + " activated"
                                    self.buttonStates[b["id"]]["state"] = "pressed"
                                elif body["s"] == 0:
                                    alert = b["name"] + " cleared"
                                    self.buttonStates[b["id"]]["state"] = "inactive"
                                subject =  alert
                                if "email" in b:
                                    if b["email"] != "":
                                        reactor.callInThread(sendMail, b["email"], subject, alert)
                                if "sms" in b:
                                    if b["sms"] != "":
                                        reactor.callInThread(sendSMS, alert, b["sms"])
                                changed = True
                            if "p" in body:
                                if bid == self.buttonStates[b["id"]]["bid"]:
                                    self.buttonStates[b["id"]]["ssid"] = body["p"]
                                    changed = True
                                elif body["p"] > self.buttonStates[b["id"]]["ssid"]:
                                    self.buttonStates[b["id"]]["ssid"] = body["p"]
                                    self.buttonStates[b["id"]]["bid"] = bid
                                    changed = True
                            if changed:
                                logger.debug("State changed: %s", str(json.dumps(self.buttonStates, indent=4)))
                                state = ("disconnected" if not self.buttonStates[b["id"]]["connected"] else self.buttonStates[b["id"]]["state"])
                                status = {
                                    "$set": {
                                        "state": state,
                                        "signal": self.buttonStates[b["id"]]["ssid"],
                                        "bridge": bid
                                    }
                                }
                                logger.debug("Posting: %s", str(json.dumps(status, indent=4)))
                                reactor.callInThread(postButtonStatus, status, b["_id"])
                        break
        #except Exception as ex:
        #    logger.warning("onmessage. Problem processing message body, type: %s, exception: %s", str(type(ex)), str(ex.args))

if __name__ == '__main__':
    connection = Connection()
