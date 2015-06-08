# Button Client
A ContinuumBridge client for Button App (button_app)

This client has two parts:

* A web-app back-end that drives a user interface, which is largely used for configuration.
* A client body that communicates via the Bridge Controller with a bridge-app and, in response to this, sends emails, texts and posts data to an API.

The behaviour of the bridge-app is also described here.

Overall Behaviour
-----------------
A bridge listens for advertising messages from BLE beacons with specified UUIDs. Individuall beacons are identified by the BLE major value. The LSB minor value is used to indicate the button state: 0 for inactive, 1 for active. In the active state, the button flashes an LED. The button is activated by pressing it once. It is deactivated by keeping it pressed for at least 3 seconds (or alternatively, by two quick presses. This is up to the implementation). At all times the button should advertise at least every 10 seconds. This will be used to determine whether the button is connected, and to which bridge it is connected. 

Buttons
-------
All buttons will generally have the same UUID. Optionally, some organisations may have a specific UUID (future). Each button will be programmed with a unique (with a UUID) major value. The major value will be put on a label on the back of the button. 

Bridge-App
----------
The bridge-app (magic_button) should be connected to  a BLE Scanner peripheral device. The BLE Scanner continually scans for BLE beacons. Apps can subscribe to receive the beacon information for certain UUIDs. A given organisation that uses buttons should use buttons with a particular UUID, or at least a small number of UUIDs. 

When the app is started, it either uses a locally stored config or it receives configuration from the bridge-app client. This contains the UUID(s) to monitor and the client ID (CID) to communicate with.


Web-App
-------
Each user/organisation will have their/its own login. Users will only be able to see their own buttons (ones that they have entered the IDs for, at this stage).

For each button, the following information will be displayed on a web page, possibly just in a line, but this is up to the designer.

ID     Enable    Name      Email       SMS      State   Signal

Where:
- ID is the button ID/major number. Text box.
- Enable - radio button or similar that enables this button.
- Name - The "friendly name". Text box.
- Email - Comma-separated email addresses to send message to. Text box.
- SMS - Comma-separated numbers to send SMSs to. Text box.
- State - Current state of the button. 
- Signal - Signal strength.
 
A user will enter: ID, Enable, Name, Email, SMS. Both Email and SMS are optional. This information will be stored in a database. Once the corresponding button is connected, the state and signal strength will be displayed. 

* State is: Inactive, Pressed or Not Connected. Icons may be used to indicate this.
* Signal strength is 0 to 5. Icons may be used, eg: [here](http://www.shutterstock.com/pic-221484118/stock-vector-signal-strength-indicator-set-flat-graphics.html?src=asIqJmbM-ZNwdGWK0H6iiw-1-2)
 
The name of the bridge that is currently receiving advertising messages from the button may be displayed next to the signal strength (future)?

Web-App/Client API
------------------
(This section will be expanded).
A REST interface will be implemented, either over HTTP or using JSON over a TCP socket. It is assumed in the following that the bridge-app client is the client and the web-app is the server.

All requests to the API should include the header "X-Auth-Token: galvanize".

    GET <>
    http://54.76.157.10:3005/api/buttons/
    Response:
    {
        [
            {
               "_id":"LgZgdk7jQdbfcDTBH",
               "listId":"XzyhiEw9GB9AfkjWh",
               "enabled": <bool>,
               "id": <string>,
               "name": <string>,
               "email": <string>,
               "sms": <string>,
               "createdAt":<ISO8601 string>
            }
        ]
    }

    PATCH <>
    To perform a PATCH request, make a PUT request and specify data to update in the "$set" field.
    http://54.76.157.10:3005/api/buttons/<button _id ie. LgZgdk7jQdbfcDTBH>
    Request:
    {
        "$set":
        {
            "state": "inactive|pressed|disconnected",
            "signal": "0..5",
            "bridge": "the id of the bridge that the button is connected to"
        }
    }

 In the first revision, a GET will return the entire contents of the buttons database; a PATCH can be used to update the values of one of more buttons.

Bridge-App Client
-----------------
