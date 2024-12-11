from flask import *
from msal import ConfidentialClientApplication
from mysql.connector import *
import mysql.connector
import os
import re
from datetime import *
import time

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

CLIENT_ID = '64141594-9d10-4ae2-82c7-43a73eef5e20'
CLIENT_SECRET = 'xca8Q~AGugkyWFFgihOw-nBwYV1hnrSilLrFXaF5'
AUTHORITY = 'https://login.microsoftonline.com/common'  # "common" allows users from any organization
REDIRECT_URI = 'http://localhost:8080/microsoftLoginCallback'
SCOPE = ["User.Read"]  # Read basic user profile

def dbConnect():
    return mysql.connector.connect(
    host="localhost",
    user="dpmhost",
    password="tlw7uwa1537b66d6p0o2",
    autocommit = True,
    database="Dorm Pass Manager",
    buffered = True
)

def get_msal_app():
    return ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    
def checkUserInformation(usergetparam, msoid):
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute(f"SELECT {usergetparam} FROM users WHERE msoid = %s", (msoid,))
            dbcursorfetch = dbcursor.fetchall()
            
    if len(dbcursorfetch) < 1:
        return None
    
    return dbcursorfetch[0]

def getLocationsInformation(locationid = None):
    if locationid == None:
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM locations WHERE type = 1")
                dbcursorfetch = dbcursor.fetchall()
    else:
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM locations WHERE locationid = %s AND type = 1", (locationid,))
                dbcursorfetch = dbcursor.fetchall()
    
    if len(dbcursorfetch) < 1:
        return None
    
    return dbcursorfetch

def joinLocations(locationList):
    joinedString = ""
    for i in range(len(locationList)):
        joinedString += str(locationList[i][1])
        joinedString += ','
    joinedString = joinedString[:-1]
    return joinedString

def ensureLoggedIn(session):
    try:
        if session.get('login'):
            return True
        else:
            return False
    except:
        return False
    
def currentDatetime():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def listToJson(lst):
    res_dict = {}
    for i in range(len(lst)):
        res_dict[str(lst[i][0])] = lst[i][1:]
    return res_dict
     
@app.route('/')
def home():
    if ensureLoggedIn(session):
        return redirect('/mslogin')
    else:
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
        userInfo = checkUserInformation("userid, name, msoid, email, role, locationid", msoid)
        print(userInfo)
        session['msoid'] = msoid
        if userInfo == None:
            return render_template('userNotRegistered.html', email = msUserInfo["preferred_username"])
        session['login'] = True
        return redirect('/passManager')
    else:
        return f'Error: {result.get("error_description")}', 400
    
@app.route('/getLocationId', methods=['POST'])
def getLocationId():
    if ensureLoggedIn(session):
        retinfo = {}
        
        locationtype = request.json.get('type')
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT locationid, name FROM locations WHERE type = %s", (locationtype,))
                dbcursorfetch = dbcursor.fetchall()
                
        print(dbcursorfetch)
        
        retinfo['status'] = 'ok'
        retinfo['locationJson'] = listToJson(dbcursorfetch)
        
        print(retinfo)
        
        
        return jsonify(retinfo)

    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'notloggedin'
        
        return jsonify(retinfo)
    
@app.route('/getStudents', methods=['POST'])
def getStudents():
    if ensureLoggedIn(session):
        retinfo = {}
        
        userinfo = checkUserInformation("userid, name, msoid, email, role, locationid", session.get('msoid'))
        userid = userinfo[0]
        userlocation = userinfo[5]
        
        searchfilters = request.json.get('filter')
        
        sqlquery = "SELECT * FROM passes WHERE 1 = 1 "
        sqlqueryvar = []
        
        try:
            locationfilter = searchfilters['location']
            sqlquery += "AND destinationid = %s "
            if locationfilter == 'local':
                sqlqueryvar += str(userlocation)
            else:
                sqlqueryvar += str(locationfilter)
        except KeyError:
            pass            
            
        try:
            flagfilter = searchfilters['flag']
            if flagfilter:
                sqlquery += "AND flagged = TRUE "
        except KeyError:
            pass
        
        try:
            statusfilter = searchfilters['status']
            nullstatus = ['AND fleavetime = NULL ', 'AND darrivetime = NULL', 'AND dleavetime = NULL', 'AND farrivetime = NULL']
            sqlquery += nullstatus[statusfilter]
        except KeyError:
            pass
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute(sqlquery, sqlqueryvar)
                dbcursorfetch = dbcursor.fetchall()
        
        retinfo['status'] = 'ok'
        retinfo['students'] = dbcursorfetch
        print(dbcursorfetch)
        return jsonify(retinfo)       
    
@app.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    if ensureLoggedIn(session):
        retinfo = {}
        
        userinfo = ["user"]
        userinfo += checkUserInformation("userid, name, email, locationid", session.get('msoid')) 
        userinfo = [userinfo]
        
        print(userinfo)
        
        retinfo["status"] = 'ok'
        retinfo["userinfo"] = listToJson(userinfo)
        
        return jsonify(retinfo)
        
    
@app.route('/newPass', methods=['POST'])
def newPass():
    if ensureLoggedIn(session): 
        retinfo = {}
        
        studentid = request.json.get('studentid')
        destinationid = request.json.get('destinationid')
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM passes WHERE studentid = %s AND farrivetime = NULL", (studentid,))
                dbcursorfetch = dbcursor.fetchall()
        
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'passactive'
            retinfo['passid'] = dbcursorfetch[0][0]
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM locations WHERE locationid = %s", (destinationid))
                dbcursorfetch = dbcursor.fetchall()
        
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'nulllocation'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM students WHERE studentid = %s", (studentid))
                dbcursorfetch = dbcursor.fetchall()
        
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'nullstudent'
            
            return jsonify(retinfo)
        
        if str(destinationid) in dbcursorfetch[0][5].split():
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'locationdisabled'
            
            return jsonify(retinfo)
        
        userinfo = checkUserInformation("userid, name, msoid, email, role, locationid", session.get('msoid'))
        userid = userinfo[0]
        userlocationid = userinfo[5]
        
        leavetime = currentDatetime()
        
        try:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('INSERT INTO passes (studentid, floorid, destinationid, fleavetime, darrivetime, dleavetime, farrivetime, flagged, creatorid, approverid) VALUES (%s, %s, %s, %s, NULL, NULL, NULL, FALSE, %s, NULL)', (studentid, userlocationid, destinationid, leavetime, userid))
                    dbcursorfetch = dbcursor.fetchall()
        except:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'sqlerror'
            
            return jsonify(retinfo)
        
        retinfo['status'] = 'ok'
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'notloggedin'
        
        return jsonify(retinfo)
    
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
    if ensureLoggedIn(session):
        return render_template('passManager.html')
    else:
        return redirect('/')

if __name__ == '__main__':
    app.run(port=8080, host="localhost")