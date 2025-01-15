from flask import *
from cryptography.fernet import Fernet
from msal import ConfidentialClientApplication
from mysql.connector import *
import mysql.connector
import os
import re
from datetime import *
import time
import string
import random
import hashlib

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

encryption_key = Fernet.generate_key()
fernet = Fernet(encryption_key)

passkeylength = 32

studentSearchLimit = 20

debug = False

CLIENT_ID = '64141594-9d10-4ae2-82c7-43a73eef5e20'
CLIENT_SECRET = 'xca8Q~AGugkyWFFgihOw-nBwYV1hnrSilLrFXaF5'
AUTHORITY = 'https://login.microsoftonline.com/common'  # "common" allows users from any organization
REDIRECT_URI = 'http://localhost:8080/microsoftLoginCallback'
SCOPE = ["User.Read"]  # Read basic user profile

def dprint(text):
    if debug:
        print(text)
        
def encrypt(data):
    encrypted_data = str(fernet.encrypt(data.encode()).decode('ascii'))
    return encrypted_data

def decrypt(encrypted_data):
    decrypted_data = fernet.decrypt(encrypted_data).decode()
    return decrypted_data

def generateSHA256(text):
    return str(hashlib.sha256(text.encode()).hexdigest())

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
    
def checkUserInformation(usergetparam, oid):
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute(f"SELECT {usergetparam} FROM users WHERE oid = %s", (oid,))
            dbcursorfetch = dbcursor.fetchall()
            
    if len(dbcursorfetch) < 1:
        return None
    
    return dbcursorfetch[0]

def getLocationsInformation(type, locationid = None):
    if locationid == None:
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT locationid, name FROM locations WHERE type = %s", (type,))
                dbcursorfetch = dbcursor.fetchall()
    else:            
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT locationid, name FROM locations WHERE locationid = %s AND type = %s", (locationid, type,))
                dbcursorfetch = dbcursor.fetchall()
    
    if len(dbcursorfetch) < 1:
        return None
    
    return dbcursorfetch

def getLocationType(locationid):
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute("SELECT type FROM locations WHERE locationid = %s", (locationid,))
            dbcursorfetch = dbcursor.fetchall()
                        
    return dbcursorfetch[0][0]

def getSettingsValue(settingName):
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute('SELECT value FROM settings WHERE name = %s', (settingName,))
            dprint(dbcursor.statement)
            dbcursorfetch = dbcursor.fetchall()
                       
    dprint('setf')
    dprint(dbcursorfetch) 
    return dbcursorfetch[0][0]

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
    return datetime.now()

def listToJson(lst):
    res_dict = {}
    for i in range(len(lst)):
        res_dict[str(lst[i][0])] = lst[i][1:]
    return res_dict

def getPassStatus(passid):
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute('SELECT fleavetime, darrivetime, dleavetime, farrivetime FROM passes WHERE passid = %s', (passid,))
            result = dbcursor.fetchall()
            
    if result[0][0] == None:
        return 0
    elif result[0][1] == None:
        return 1
    elif result[0][2] == None:
        return 2
    elif result[0][3] == None:
        return 3
    
def calculateElapsedSeconds(timestamp):
    rawtime = currentDatetime() - timestamp
    return rawtime.days * 86400 + rawtime.seconds

def convertSecondsToTime(seconds):
    seconds = seconds % (24 * 3600)
    hour = seconds // 3600
    seconds %= 3600
    minutes = seconds // 60
    seconds %= 60
     
    return [hour, minutes, seconds]

class sessionStorage:
    def create(oid = None, keepstatedays = 7):
        passkey = ''.join(random.choices(string.ascii_uppercase + string.digits, k=passkeylength))
        expdate = currentDatetime() + timedelta(days=keepstatedays)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('INSERT INTO sessions (oid, passkey, expdate) VALUES (%s, %s, %s)', (oid, passkey, expdate))
                dbcursor.execute('SELECT LAST_INSERT_ID()')
                result = dbcursor.fetchall()
                                
        return [str(result[0][0]), passkey]
                
    def verify(sessionid, passkey):
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT oid, expdate FROM sessions WHERE sessionid = %s AND passkey = %s', (sessionid, passkey))
                result = dbcursor.fetchall()
        
        if len(result) < 1:
            return None

        oid = result[0][0]
        expdate = result[0][1]
        
        if expdate < currentDatetime():
            return None
        
        return oid
    
def getOidFromSession(session):
    sessionid = decrypt(str(session.get('sessionid')))
    passkey = decrypt(str(session.get('passkey')))
    
    print('gofsi')
    print([sessionid, passkey])
    
    oid = sessionStorage.verify(sessionid, passkey)
    
    return oid

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
def microsoftLoginCallback():
    code = request.args.get('code')
    if not code:
        return 'Authorization code missing', 400
    msal_app = get_msal_app()
    result = msal_app.acquire_token_by_authorization_code(code, scopes=SCOPE, redirect_uri=REDIRECT_URI)
    if 'access_token' in result:
        msUserInfo = result.get('id_token_claims')
        oid = msUserInfo["oid"]
        userInfo = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        dprint(userInfo)
        sessioninfo = sessionStorage.create(oid)
        session['sessionid'] = str(encrypt(sessioninfo[0]))
        session['passkey'] = str(encrypt(sessioninfo[1]))
        if userInfo == None:
            return render_template('userNotRegistered.html', email = msUserInfo["preferred_username"])
        session['login'] = True
        return redirect('/passCatalogue')
    else:
        return f'Error: {result.get("error_description")}', 400
    
@app.route('/maintainerLoginCallback', methods=['POST'])
def maintainerLoginCallback():
    username = request.form['username']
    password = request.form['password']
    
    print(username)
    print(password)
    
    passwordhash = generateSHA256(password)
    
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute('SELECT oid FROM users WHERE username = %s AND password = %s', (username, passwordhash))
            result = dbcursor.fetchall()
            
    if len(result) < 1:
        oid = result[0][0]
        userInfo = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        sessioninfo = sessionStorage.create(oid)
        session['sessionid'] = str(encrypt(sessioninfo[0]))
        session['passkey'] = str(encrypt(sessioninfo[1]))
        session['login'] = True
        return redirect('/passCatalogue')
    else:
        return render_template('userNotRegistered.html', email = username)
    
@app.route('/getLocationId', methods=['POST'])
def getLocationId():
    if ensureLoggedIn(session):
        retinfo = {}
        
        locationtype = request.json.get('type')
        
        locations = getLocationsInformation(locationtype)
                        
        retinfo['status'] = 'ok'
        retinfo['locationJson'] = listToJson(locations)
        
        dprint(retinfo)
        
        
        return jsonify(retinfo)

    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'notloggedin'
        
        return jsonify(retinfo)
    
@app.route('/updatePass', methods=['POST'])
def updatePass():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        userinfo = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        userid = userinfo[0]
        userlocation = userinfo[5]
        
        passid = request.json.get('passid')
                
        retinfo["elapsedtime"] = None
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM passes WHERE passid = %s', (passid,))
                result = dbcursor.fetchall()
                
        if len(result) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'invalidpass'
            
            return jsonify(retinfo)
        
        studentid = result[0][1]
        floorid = result[0][2]
        destinationid = result[0][3]
                
        floorname = getLocationsInformation(2, floorid)[0][1]
        destinationname = getLocationsInformation(1, destinationid)[0][1]
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT name, grade FROM students WHERE studentid = %s', (studentid,))
                result = dbcursor.fetchall()
                
        dprint(result)
        
        studentname = result[0][0]
        studentgrade = 'Grade ' + str(result[0][1])
        
        sqlquery = 'UPDATE passes SET '
        sqlqueryvar = []
        
        updateflag = request.json.get('flag')
        if updateflag != None:
            sqlquery += 'flagged = true, '
        
        updatefloorid = request.json.get('floorid')
        if updatefloorid != None:
            floorname = getLocationsInformation(2, updatefloorid)[0][1]
            sqlquery += 'floorid = %s, '
            sqlqueryvar += str(updatefloorid)
        
        updatedestinationid = request.json.get('destinationid')
        if updatedestinationid != None:
            destinationname = getLocationsInformation(1, updatedestinationid)[0][1]
            sqlquery += 'destinationid = %s, '
            sqlqueryvar += str(updatedestinationid)

        updateapprove = request.json.get('approve')
        if updateapprove != None:
            timestamp = currentDatetime()

            stampposition = 0
            timepositions = ['fleavetime', 'darrivetime', 'dleavetime', 'farrivetime']
            approvepositions = ['flapprover', 'daapprover', 'dlapprover', 'faapprover']
            
            stampposition = getPassStatus(passid)
                        
            if stampposition != None:
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute(f'UPDATE passes SET {timepositions[stampposition]} = "{timestamp}", {approvepositions[stampposition]} = %s WHERE passid = %s', (userid, passid,))
                        dprint(dbcursor.statement)
                    
            retinfo["elapsedtimewarning"] = None
                    
            if stampposition != 0 and stampposition != None:
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute(f"SELECT {timepositions[stampposition - 1]}, {timepositions[stampposition]} FROM passes WHERE passid = %s", (passid,))
                        stamptime = dbcursor.fetchall()
                        
                studentWarningTimeout = int(getSettingsValue('studentWarningTimeout'))
                studentAlertTimeout = int(getSettingsValue('studentAlertTimemout'))
                studentMinimumTimeout = int(getSettingsValue('studentMinimumTimeout'))
                
                dprint(studentMinimumTimeout)
                
                stamptime = stamptime[0]
                
                dprint(type(stamptime))
                dprint(stamptime)
                    
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('SELECT fleavetime, darrivetime, dleavetime, farrivetime FROM passes WHERE passid = %s', (passid,))
                        curpass = dbcursor.fetchall()[0]
                        
                retinfo["elapsedtimewarning"] = None
                
                dprint(curpass)
                
                elapsedtime = None
                    
                if (curpass[1] != None and curpass[2] == None) or (curpass[3] != None) :
                                        
                    elapsedSecond = calculateElapsedSeconds(stamptime[0])
                    
                    elapsedtime = convertSecondsToTime(elapsedSecond)                   

                    if elapsedSecond > studentAlertTimeout:
                        retinfo["elapsedtimewarning"] = 'alert'
                    elif elapsedSecond > studentWarningTimeout:
                        retinfo["elapsedtimewarning"] = 'warning'
                    elif elapsedSecond < studentMinimumTimeout:
                        retinfo["elapsedtimewarning"] = 'min'
                    
                retinfo["elapsedtime"] = elapsedtime
                
                dprint('set')
                dprint(studentWarningTimeout)
                dprint(studentAlertTimeout)
        
        sqlquery += 'keywords = %s WHERE passid = %s'
        sqlqueryvar += [f'{studentname} {studentgrade} {floorname} {destinationname}', passid]
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dprint(sqlquery)
                dprint(sqlqueryvar)
                dbcursor.execute(sqlquery, sqlqueryvar)

        retinfo['status'] = 'ok'
        
        return jsonify(retinfo)
    
@app.route('/getStudents', methods=['POST'])
def getStudents():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        userinfo = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        userid = userinfo[0]
        userlocation = userinfo[5]
        userlocationtype = getLocationType(userlocation)
        
        searchfilters = request.json.get('filter')
        
        sqlquery = "SELECT passid, studentid, floorid, destinationid, fleavetime, darrivetime, dleavetime, farrivetime, flagged FROM passes WHERE 1 = 1 "
        sqlqueryvar = []
        
        allfilter = False
        
        try:
            if searchfilters['all']:
                allfilter = True
        except KeyError:
            pass
        
        if not allfilter:
            try:
                if userlocationtype == 1:
                    sqlquery += "AND destinationid = %s "
                    sqlqueryvar += str(userlocation)
                else:
                    sqlquery += "AND floorid = %s "
                    sqlqueryvar += str(userlocation)
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
            if userlocationtype == 2:
                statusfilter -= 2
            nullstatus = ['AND fleavetime IS NULL ', 'AND fleavetime IS NOT NULL AND darrivetime IS NULL ', 'AND darrivetime IS NOT NULL AND dleavetime IS NULL ', 'AND dleavetime IS NOT NULL AND farrivetime IS NULL ']
            dprint(nullstatus[statusfilter])
            sqlquery += nullstatus[statusfilter]
        except KeyError:
            pass
        
        try:
            searchfilter = str(searchfilters['search'])
            searchkeywords = searchfilter.split()
            dprint(searchkeywords)
            for keyword in searchkeywords:
                dprint(keyword)
                sqlquery += 'AND keywords LIKE %s '
                sqlqueryvar.append(f'%{keyword}%')
        except KeyError:
            pass
        
        dprint(sqlquery)
        dprint(sqlqueryvar)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dprint(sqlquery)
                dprint(sqlqueryvar)
                dbcursor.execute(sqlquery, sqlqueryvar)
                dprint('execed')
                dprint(dbcursor.statement)
                dbcursorfetch = dbcursor.fetchall()
                
        studentWarningTimeout = int(getSettingsValue('studentWarningTimeout'))
        studentAlertTimeout = int(getSettingsValue('studentAlertTimemout'))
                
        curpasscur = 0
        for curpass in dbcursorfetch:
            if (curpass[4] != None and curpass[5] == None) or (curpass[6] != None and curpass[7] == None) :
                for i in range(4):
                    dprint('d')
                    dprint(curpass)
                    dprint(-2 - i)
                    dprint(curpass[-2 - i])
                    if curpass[-2 - i] != None:
                        elapsedSecond = calculateElapsedSeconds(curpass[-2 - i])

                        if elapsedSecond > studentAlertTimeout:
                            dbcursorfetch[curpasscur] += ('alert',)
                        elif elapsedSecond > studentWarningTimeout:
                            dbcursorfetch[curpasscur] += ('warning',)
                        else:
                            dbcursorfetch[curpasscur] += (None,)

                        break
            else:
                dprint('atstablelocation')
                dbcursorfetch[curpasscur] += (None,)
                        
                
        retinfo['status'] = 'ok'
        retinfo['students'] = dbcursorfetch
        dprint(dbcursorfetch)
        return jsonify(retinfo) 
    
@app.route('/searchStudents', methods=['POST'])
def searchStudents():
    if ensureLoggedIn(session):
        retinfo = {}
        
        searchFilter = request.json.get('searchFilter')
        
        sqlquery = "SELECT name, grade, cardid, floorid, disabledlocations FROM students WHERE 1 = 1 "
        sqlqueryvar = []
        
        try:
            nameFilter = str(searchFilter['name'])
            nameKeywords = nameFilter.split()
            dprint(nameKeywords)
            for keyword in nameKeywords:
                dprint(keyword)
                sqlquery += 'AND name LIKE %s '
                sqlqueryvar.append(f'%{keyword}%')
        except KeyError:
            pass
        
        try:
            gradeFilter = int(searchFilter['grade'])
            dprint(gradeFilter)
            sqlquery += 'AND grade = %s '
            sqlqueryvar.append(gradeFilter)
        except KeyError:
            pass
        
        try:
            cardidFilter = str(searchFilter['cardid'])
            dprint(cardidFilter)
            sqlquery += 'AND cardid = %s '
            sqlqueryvar.append(cardidFilter)
        except KeyError:
            pass
        
        try:
            flooridFilter = str(searchFilter['floorid'])
            dprint(flooridFilter)
            sqlquery += 'AND floorid = %s '
            sqlqueryvar.append(flooridFilter)
        except KeyError:
            pass
        
        dprint(sqlquery)
        dprint(sqlqueryvar)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dprint(sqlquery)
                dprint(sqlqueryvar)
                dbcursor.execute(sqlquery, sqlqueryvar)
                dprint('execed')
                dprint(dbcursor.statement)
                dbcursorfetch = dbcursor.fetchall()
                
        retinfo['status'] = 'ok'
        retinfo['students'] = dbcursorfetch[:studentSearchLimit]

        return jsonify(retinfo)            
    
@app.route('/updateUserLocation', methods=['POST'])
def updateUserLocation():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        userid = checkUserInformation("userid", oid)[0]
        
        locationName = str(request.json.get('location'))
        
        dprint(type(locationName))
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT locationid FROM locations WHERE name = %s', (locationName,))
                dbcursorfetch = dbcursor.fetchall()
                                
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'invalidlocation'
            
            return jsonify(retinfo)
                
        locationid = dbcursorfetch[0][0]
                
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('UPDATE users SET locationid = %s WHERE userid = %s', (locationid, userid,))
                
        retinfo['status'] = 'ok'
        
        return jsonify(retinfo)
        
    
@app.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        userinfo = ["user"]
        userinfo += checkUserInformation("userid, name, email, locationid", oid) 
        userinfo = [userinfo]
        
        dprint(userinfo)
        
        retinfo["status"] = 'ok'
        retinfo["userinfo"] = listToJson(userinfo)
        
        return jsonify(retinfo)
    
@app.route('/getStudentInfo', methods=['POST'])
def getStudentsInfo():
    if ensureLoggedIn(session):
        retinfo = {}
        
        studentid = str(request.json.get('studentid'))
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT name, grade, floorid, disabledlocations FROM students WHERE studentid = %s", (studentid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) < 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'nostudent'
            
            return jsonify(retinfo)
        
        studentinfo = dbcursorfetch[0]
        
        retinfo['status'] = 'ok'
        retinfo['studentinfo'] = studentinfo
        
        return jsonify(retinfo)
        
    
@app.route('/newPass', methods=['POST'])
def newPass():
    if ensureLoggedIn(session): 
        retinfo = {}
        
        studentid = request.json.get('studentid')
        destinationid = request.json.get('destinationid')
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM passes WHERE studentid = %s AND farrivetime IS null", (studentid,))
                dbcursorfetch = dbcursor.fetchall()
                
                dprint('pa')
                dprint(dbcursorfetch)
        
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'passactive'
            retinfo['passid'] = dbcursorfetch[0][0]
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM locations WHERE locationid = %s", (destinationid,))
                dbcursorfetch = dbcursor.fetchall()
        
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'nulllocation'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute("SELECT * FROM students WHERE studentid = %s", (studentid,))
                dbcursorfetch = dbcursor.fetchall()
        
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'nullstudent'
            
            return jsonify(retinfo)
        
        if str(destinationid) in dbcursorfetch[0][5].split():
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'locationdisabled'
            
            return jsonify(retinfo)
        
        oid = getOidFromSession(session)
        
        userinfo = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        userid = userinfo[0]
        userlocationid = userinfo[5]
        timestamp = currentDatetime()
                
        try:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('INSERT INTO passes (studentid, floorid, destinationid, creationtime) VALUES (%s, %s, %s, %s)', (studentid, userlocationid, destinationid, timestamp,))
                                        
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT passid FROM passes WHERE studentid = %s AND fleavetime IS null', (studentid,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            passid = str(dbcursorfetch[0][0])
        except:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'sqlerror'
            
            return jsonify(retinfo)
        
        retinfo['status'] = 'ok'
        retinfo['passid'] = passid
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'notloggedin'
        
        return jsonify(retinfo)
    
@app.route('/checkOid')
def checkOid():
    oid = str(decrypt(session["oid"]))
    return f"OID: {oid}"

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

@app.route('/passCatalogue')
def passCatalogue():
    if ensureLoggedIn(session):
        return render_template('passCatalogue.html')
    else:
        return redirect('/')
    
@app.route('/managePanel')
def managePanel():
    if ensureLoggedIn(session):
        return render_template('managePanel.html')
    else:
        return redirect('/')

if __name__ == '__main__':
    app.run(port=8080, host="localhost")