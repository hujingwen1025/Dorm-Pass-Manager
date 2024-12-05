from flask import *
from msal import ConfidentialClientApplication
import mysql.connector
import os
import re
from datetime import timedelta

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

dpmdb = mysql.connector.connect(
    host="localhost",
    user="dpmhost",
    password="tlw7uwa1537b66d6p0o2",
    autocommit = True,
    database="Dorm Pass Manager",
)

dbcursor = dpmdb.cursor()

CLIENT_ID = '64141594-9d10-4ae2-82c7-43a73eef5e20'
CLIENT_SECRET = 'xca8Q~AGugkyWFFgihOw-nBwYV1hnrSilLrFXaF5'
AUTHORITY = 'https://login.microsoftonline.com/common'  # "common" allows users from any organization
REDIRECT_URI = 'http://localhost:8080/microsoftLoginCallback'
SCOPE = ["User.Read"]  # Read basic user profile

def get_msal_app():
    return ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    
def checkUserInformation(msoid):
    dbcursor.execute(f"SELECT * FROM users WHERE msoid = %s", (msoid,))
    dbcursorfetch = dbcursor.fetchall()
        
    if len(dbcursorfetch) < 1:
        return None
    
    return dbcursorfetch[0]

def getLocationsInformation(locationid = None):
    if locationid == None:
        dbcursor.execute("SELECT * FROM locations")
        dbcursorfetch = dbcursor.fetchall()
    else:
        dbcursor.execute("SELECT * FROM locations WHERE locationid = %s", (locationid,))
        dbcursorfetch = dbcursor.fetchall()[0]
    
    if len(dbcursorfetch) < 1:
        return None
    
    return dbcursorfetch
     
@app.route('/')
def home():
    try:
        if session.get('login') == True:
            return redirect('/mslogin')
        else:
            return render_template('signin.html')
    except:
        return render_template('signin.html')
    
@app.route('/signout')
def signout():
    session.clear()
    return redirect('/')

@app.route('/maintainerSignin')
def maintainerSignin():
    return render_template('maintainerLogin.html')
    
@app.route('/mslogin')
def login():
    msal_app = get_msal_app()
    auth_url = msal_app.get_authorization_request_url(SCOPE, redirect_uri=REDIRECT_URI)
    return redirect(auth_url)

@app.route('/microsoftLoginCallback')
def getAToken():
    code = request.args.get('code')
    if not code:
        return 'Authorization code missing', 400
    msal_app = get_msal_app()
    result = msal_app.acquire_token_by_authorization_code(code, scopes=SCOPE, redirect_uri=REDIRECT_URI)
    if 'access_token' in result:
        msUserInfo = result.get('id_token_claims')
        msoid = msUserInfo["oid"]
        userInfo = checkUserInformation(msoid)
        session['msoid'] = msoid
        if userInfo == None:
            return render_template('userNotRegistered.html', email = msUserInfo["preferred_username"])
        session['login'] = True
        return redirect('/passManager')
    else:
        return f'Error: {result.get("error_description")}', 400
    
@app.route('/checkMsoid')
def checkMsoid():
    msoid = session["msoid"]
    return f"MSOID: {msoid}"

@app.route('/maintainerDashboard')
def maintainerDashboard():
    return render_template('maintainerDashboard.html')

@app.route('/studentInfoDisplay')
def studentInfoDisplay():
    return render_template('studentInfoDisplay.html')

@app.route('/studentInfoFrame')
def studentInfoFrame():
    return render_template('studentInfoFrame.html')

@app.route('/studentDestinationChooser')
def studentDestinationChooser():
    return render_template('studentDestinationChooser.html')

@app.route('/webSerialTest')
def webSerialTest():
    return render_template('webSerialTest.html')

@app.route('/passManager')
def passManager():
    try:
        if session.get('login'):
            userinfo = checkUserInformation(session.get('msoid'))
            username = userinfo[1]
            useremail = userinfo[3]
            userlocation = userinfo[5]
            locationinfo = getLocationsInformation(userlocation)
            if locationinfo == None:
                locationname = 'None'
                locationtype = 'None'
                locationcapacity = 'None'
            locationname = locationinfo[1]
            locationtype = locationinfo[2]
            locationcapacity = locationinfo[3]
            return render_template('passManager.html', username = username, useremail = useremail, locationname = locationname, locationtype = locationtype, locationcapacity = locationcapacity)
        else:
            return redirect('/')
    except:
        return redirect('/')

if __name__ == '__main__':
    app.run(port=8080, host="localhost")