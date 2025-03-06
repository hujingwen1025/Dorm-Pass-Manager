from flask import *
from flask_session_captcha import FlaskSessionCaptcha
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
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

app.config['CAPTCHA_ENABLE'] = True
app.config['CAPTCHA_LENGTH'] = 7
app.config['CAPTCHA_WIDTH'] = 200
app.config['CAPTCHA_HEIGHT'] = 45
app.config['CAPTCHA_INCLUDE_ALPHABET'] = False
app.config['CAPTCHA_INCLUDE_NUMERIC'] = True

captcha = FlaskSessionCaptcha(app)

encryption_key = Fernet.generate_key()
fernet = Fernet(encryption_key)

debug = False

CLIENT_ID = '64141594-9d10-4ae2-82c7-43a73eef5e20'
CLIENT_SECRET = 'xca8Q~AGugkyWFFgihOw-nBwYV1hnrSilLrFXaF5'
AUTHORITY = 'https://login.microsoftonline.com/common'  # "common" allows users from any organization
REDIRECT_URI = 'http://localhost:8080/microsoftLoginCallback'
SCOPE = ["User.Read"]  # Read basic user profile

def dprint(text):
    if debug:
        dprint(text)
        
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
        sessionid = decrypt(str(session.get('sessionid')))
        passkey = decrypt(str(session.get('passkey')))
        if sessionStorage.verify(sessionid, passkey) != None:
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
    else:
        return None
    
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

def checkNameLength(name):
    minNameLength = int(getSettingsValue('minNameLength'))
    maxNameLength = int(getSettingsValue('maxNameLength'))
    
    if len(name) < minNameLength or len(name) > maxNameLength:
        return False
    else:
        return True
    
def checkGrade(grade):
    minGrade = int(getSettingsValue('minGrade'))
    maxGrade = int(getSettingsValue('maxGrade'))
    
    if int(grade) < minGrade or int(grade) > maxGrade:
        return False
    else:
        return True
    
def checkCardidLength(cardid):
    minCardidLength = int(getSettingsValue('minCardidLength'))
    maxCardidLength = int(getSettingsValue('maxCardidLength'))
    
    if len(cardid) < minCardidLength or len(cardid) > maxCardidLength:
        return False
    else:
        return True
    
def checkEmailLength(email):
    minEmailLength = int(getSettingsValue('minEmailLength'))
    maxEmailLength = int(getSettingsValue('maxEmailLength'))
    
    if len(email) < minEmailLength or len(email) > maxEmailLength:
        return False
    else:
        return True
    
def sendEmail(subject, body, recipient_email):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = 'DPM - Exabyte Tech'
    msg['To'] = recipient_email
    
    try:
        with smtplib.SMTP_SSL(getSettingsValue('smtpServer'), 465) as smtp_server:
            smtp_server.login(getSettingsValue('smtpEmail'), getSettingsValue('smtpPassword'))

            smtp_server.sendmail(getSettingsValue('smtpEmail'), recipient_email, msg.as_string())

            return True
    except:
        return False

class sessionStorage:
    def create(oid, keepstatedays):
        passkeylength = int(getSettingsValue('passkeyLength'))
        passkey = ''.join(random.choices(string.ascii_uppercase + string.digits, k=passkeylength))
        expdate = currentDatetime() + timedelta(days=keepstatedays)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('INSERT INTO sessions (oid, passkey, expdate, active) VALUES (%s, %s, %s, %s)', (oid, passkey, expdate, True))
                dbcursor.execute('SELECT LAST_INSERT_ID()')
                result = dbcursor.fetchall()
                                
        return [str(result[0][0]), passkey]
                
    def verify(sessionid, passkey):
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT oid, expdate, active FROM sessions WHERE sessionid = %s AND passkey = %s', (sessionid, passkey))
                result = dbcursor.fetchall()
        
        if len(result) < 1:
            return None
        
        sessionActive = result[0][2]
        
        if not sessionActive:
            return None

        oid = result[0][0]
        expdate = result[0][1]
        
        if expdate < currentDatetime():
            return None
        
        return oid
    
    def deactivate(sessionid, passkey):
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('UPDATE sessions SET active = FALSE WHERE sessionid = %s AND passkey = %s', (sessionid, passkey))
                
        return True
    
def getOidFromSession(session):
    sessionid = decrypt(str(session.get('sessionid')))
    passkey = decrypt(str(session.get('passkey')))
    
    dprint('gofsi')
    dprint([sessionid, passkey])
    
    oid = sessionStorage.verify(sessionid, passkey)
    
    return oid

@app.route('/')
def home():
    if ensureLoggedIn(session):
        return redirect('/passCatalogue')
    else:
        return render_template('signin.html')
    
@app.route('/kiosk')
def kiosk():
    if 'klonkiosk' in request.headers.get('User-Agent'):
        kioskEncToken = request.args.get('kioskToken')
        kioskToken = decrypt(kioskEncToken)
        kioskSession = kioskToken.split('-', 1)
        session['sessionid'] = kioskSession[0]
        session['passkey'] = kioskSession[1]
        session['login'] = True
        dprint(kioskSession)
        return render_template('kiosk.html')
    else:
        return redirect('/')
    
@app.route('/signout')
def signout():
    deactivateResult = sessionStorage.deactivate(decrypt(str(session.get('sessionid'))), decrypt(str(session.get('passkey'))))
    if deactivateResult:
        session.clear()
        return redirect('/')
    else:
        return 'Error signing out'

@app.route('/userSignin')
def userSignin():
    return render_template('passwordLogin.html')
    
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
    dprint(result)
    if 'access_token' in result:
        msUserInfo = result.get('id_token_claims')
        oid = msUserInfo["oid"]
        email = msUserInfo["preferred_username"]
        urin = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        if urin == None:
            return render_template('userNotRegistered.html', email = msUserInfo["preferred_username"])
        userInfo = urin
        dprint(userInfo)
        keepSessionDays = int(getSettingsValue('keepSessionDays'))
        sessioninfo = sessionStorage.create(oid, keepSessionDays)
        session['sessionid'] = str(encrypt(sessioninfo[0]))
        session['passkey'] = str(encrypt(sessioninfo[1]))
        if userInfo == None:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT * FROM users WHERE email = %s', (email,))
                    result = dbcursor.fetchall()
                    
            if len(result) > 0:
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('UPDATE users SET oid = %s WHERE email = %s', (oid, email,))   
                session['login'] = True
                return render_template('firstLanding.html')
            else:
                return render_template('userNotRegistered.html', email = msUserInfo["preferred_username"])
                        
            
        session['login'] = True
        return redirect('/passCatalogue')
    else:
        return f'Error: {result.get("error_description")}', 400
    
@app.route('/passwordLoginCallback', methods=['POST'])
def passwordLoginCallback():
    if captcha.validate():
        username = request.form['username']
        password = request.form['password']
        
        if username == '' or password == '' or username == None or password == None:
            return render_template('userNotRegistered.html', email = 'Password or username is empty')

        passwordhash = generateSHA256(password)

        dprint(passwordhash)

        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT oid FROM users WHERE name = %s AND password = %s', (username, passwordhash,))
                result = dbcursor.fetchall()

        if len(result) > 0:
            oid = result[0][0]
            keepSessionDays = int(getSettingsValue('keepSessionDays'))
            sessioninfo = sessionStorage.create(oid, keepSessionDays)
            session['sessionid'] = str(encrypt(sessioninfo[0]))
            session['passkey'] = str(encrypt(sessioninfo[1]))
            session['login'] = True
            return redirect('/passCatalogue')
        else:
            return render_template('userNotRegistered.html', email = username)
    else:
        return render_template('incorrectCaptcha.html')
    
@app.route('/api/searchLocations', methods=['POST'])
def searchLocations():
    if ensureLoggedIn(session):
        retinfo = {}
        
        searchFilters = request.json.get('searchFilters')
        
        try:
            locationStrictName = searchFilters['strictname']
            
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT locationid, name, type FROM locations WHERE name = %s', (locationStrictName,))
                    dbcursorfetch = dbcursor.fetchall()
                                
            retinfo['status'] = 'ok'
            retinfo['locations'] = dbcursorfetch
            
            return jsonify(retinfo)
        
        except:
            pass
        
        try:
            locationName = searchFilters['name']
            
            namekeywords = locationName.split()
            
            sqlquery = 'SELECT locationid, name, type FROM locations WHERE 1 = 1 '
            sqlqueryvar = []
            
            for keyword in namekeywords:
                sqlquery += 'AND name LIKE %s '
                sqlqueryvar.append(f'%{keyword}%')
                
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute(sqlquery, sqlqueryvar)
                    dbcursorfetch = dbcursor.fetchall()
                                        
            retinfo['status'] = 'ok'
            retinfo['locations'] = dbcursorfetch
            
            return jsonify(retinfo)
        
        except:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Invalid search'
            
            return jsonify(retinfo)
        
@app.route('/api/editLocation', methods=['POST'])
def editLocation():
    if ensureLoggedIn(session):
        retinfo = {}
        
        locationid = request.json.get('locationid')
        
        try:
            deleteLocation = request.json.get('delete')
            if deleteLocation == 'true':
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('SELECT * FROM locations WHERE locationid = %s', (locationid,))
                        dbcursorfetch = dbcursor.fetchall()
                        
                if len(dbcursorfetch) < 1:
                    retinfo['status'] = 'error'
                    retinfo['errorinfo'] = 'Location does not exist'
                    
                    return jsonify(retinfo)
                
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('DELETE FROM locations WHERE locationid = %s', (locationid,))
                
                retinfo['status'] = 'ok'
                
                return jsonify(retinfo)
        except:
            pass
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM locations WHERE locationid = %s', (locationid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Location does not exist'
            
            return jsonify(retinfo)
        
        locationName = request.json.get('name')
        
        if locationName == None or locationName == '':
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please fill in all of the required fields'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM locations WHERE name = %s', (locationName,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Name of location has already been taken'
            
            return jsonify(retinfo)
        
        locationType = request.json.get('type')
        
        if locationType == 'destination':
            locationType = 1
        elif locationType == 'dorm':
            locationType = 2
        else:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid location type'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('UPDATE locations SET name = %s, type = %s WHERE locationid = %s', (locationName, locationType, locationid,))
                
        retinfo['status'] = 'ok'
        
        return jsonify(retinfo)
    
@app.route('/api/getLocationId', methods=['POST'])
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
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/generateKioskToken', methods=['POST'])
def generateKioskToken():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        keepSessionDays = int(getSettingsValue('keepSessionDays'))
        sessioninfo = sessionStorage.create(oid, keepSessionDays)
        sessionid = str(sessioninfo[0])
        passskey = str(sessioninfo[1])
        
        kioskToken = encrypt(f'{sessionid}-{passskey}')
        
        retinfo['status'] = 'ok'
        retinfo['kioskToken'] = kioskToken
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/updatePass', methods=['POST'])
def updatePass():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        urin = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        if urin == None:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Not authorized to perform this action'
            
            return jsonify(retinfo)
        userinfo = urin
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
                        
            else:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Cannot approve a completed pass'
                
                return jsonify(retinfo)
                    
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
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/getStudents', methods=['POST'])
def getStudents():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        urin = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        if urin == None:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Not authorized to perform this action'
            
            return jsonify(retinfo)
        userinfo = urin
        userid = userinfo[0]
        userlocation = userinfo[5]
        userlocationtype = getLocationType(userlocation)
        
        print(userlocation)
        
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
                    sqlqueryvar += [userlocation]
                else:
                    sqlquery += "AND floorid = %s "
                    sqlqueryvar += [userlocation]
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
        
        print(sqlquery)
        print(sqlqueryvar)
        
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
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/addStudent', methods=['POST'])
def addStudent():
    if ensureLoggedIn(session):
        retinfo = {}
        
        studentName = request.json.get('name')
        studentGrade = request.json.get('grade')
        studentFloor = request.json.get('floor')
        studentCardid = request.json.get('cardid')
        studentImage = request.json.get('image')
        
        dprint([studentName, studentGrade, studentFloor, studentCardid])
        
        if studentName == None or studentGrade == None or studentFloor == None or studentName == '' or studentGrade == '' or studentFloor == '':
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please fill in all of the required fields'
            
            return jsonify(retinfo)
        
        if checkNameLength(studentName) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a name with a valid length'
            
            return jsonify(retinfo)
        
        if checkGrade(studentGrade) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid grade within a valid range'
            
            return jsonify(retinfo)
        
        if checkCardidLength(studentCardid) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a card ID with a valid length'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM students WHERE name = %s', (studentName,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Name of student has already been taken'
            
            return jsonify(retinfo)
        
        if studentImage != None and studentImage != '':   
            if not studentImage.startswith('data:image/png;base64,iVBORw0KGgo'):
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please upload a valid image'

                return jsonify(retinfo)

            if len(studentImage) > 2100000:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please upload an image that is less than 1.5MB'

                return jsonify(retinfo)
            
        else:
            studentImage = None
            
        if studentCardid != None and studentCardid != '':
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT * FROM students WHERE cardid = %s', (studentCardid,))
                    dbcursorfetch = dbcursor.fetchall()

            if len(dbcursorfetch) > 0:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Card ID has already been taken'

                return jsonify(retinfo)
        else:
            studentCardid = None
        
        try: 
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT type, locationid FROM locations WHERE name = %s', (studentFloor,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            dprint(dbcursorfetch)

            if len(dbcursorfetch) < 1:
                dprint('de')
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please enter a valid floor name'

                return jsonify(retinfo)

            if dbcursorfetch[0][0] != 2:
                dprint('dl')
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Location selected is a destination'

                return jsonify(retinfo)
            
            studentFloorId = dbcursorfetch[0][1]
        except:
            dprint('dd')
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid floor name'

            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('INSERT INTO students (name, grade, floorid, cardid, image) VALUES (%s, %s, %s, %s, %s)', (studentName, studentGrade, studentFloorId, studentCardid, studentImage,))
                dbcursor.execute('SELECT LAST_INSERT_ID()')
                dbcursorfetch = dbcursor.fetchall()
                
        retinfo['status'] = 'ok'
        retinfo['studentid'] = dbcursorfetch[0][0]
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/addUser', methods=['POST'])
def addUser():
    if ensureLoggedIn(session):
        retinfo = {}
        
        userName = request.json.get('name')
        userEmail = request.json.get('email')
        userRole = request.json.get('role')
        userLocation = request.json.get('location')
        userPassword = request.json.get('password')
        
        dprint([userName, userEmail, userRole, userLocation, userPassword])
        
        if userName == None or userEmail == None or userRole == None or userLocation == None or userName == '' or userEmail == '' or userRole == '' or userLocation == '':
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please fill in all of the required fields'
            
            return jsonify(retinfo)
        
        if checkNameLength(userName) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a name with a valid length'
            
            return jsonify(retinfo)
        
        if checkEmailLength(userEmail) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter an email with a valid length'
            
            return jsonify(retinfo)
                
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM users WHERE name = %s', (userName,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Name of user has already been taken'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM users WHERE email = %s', (userEmail,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Email of user has already been taken'
            
            return jsonify(retinfo)
        
        if userPassword == None or userPassword == '':
            userPassword = None
        else:
            if len(userPassword) < 8:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Password must be at least 8 characters long'
                
                return jsonify(retinfo)
            
            if len(userPassword) > 32:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Password must be less than 32 characters long'
                
                return jsonify(retinfo)
            
            userPassword = generateSHA256(userPassword)

        try:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT type, locationid FROM locations WHERE name = %s', (userLocation,))
                    dbcursorfetch = dbcursor.fetchall()
            
            userLocationId = dbcursorfetch[0][1]
        except:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid location'
            
            return jsonify(retinfo)
        
        if userRole == 'admin':
            userRoleId = 1
        elif userRole == 'proctor':
            userRoleId = 2
        elif userRole == 'approver':
            userRoleId = 3
        else:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid role'
            
            return jsonify(retinfo)
        
        userOid = 'usernopcoid' + userEmail + str(random.randint(100000, 999999))
                
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('INSERT INTO users (name, email, role, locationid, password, oid) VALUES (%s, %s, %s, %s, %s, %s)', (userName, userEmail, userRoleId, userLocationId, userPassword, userOid,))
                dbcursor.execute('SELECT LAST_INSERT_ID()')
                dbcursorfetch = dbcursor.fetchall()    
                
        retinfo['status'] = 'ok'
        retinfo['userid'] = dbcursorfetch[0][0]
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/addLocation', methods=['POST'])
def addLocation():
    if ensureLoggedIn(session):
        retinfo = {}
        
        locationName = request.json.get('name')
        locationType = request.json.get('type')
        
        if checkNameLength(locationName) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a name with a valid length'
            
            return jsonify(retinfo)
        
        dprint([locationName, locationType])
        
        if locationName == None or locationType == None or locationName == '' or locationType == '':
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please fill in all of the required fields'
            
            return jsonify(retinfo)
                
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM locations WHERE name = %s', (locationName,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Name of location has already been taken'
            
            return jsonify(retinfo)
        
        if locationType == 'dorm':
            locationType = 2
        elif locationType == 'destination':
            locationType = 1
        else:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid location type'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('INSERT INTO locations (name, type) VALUES (%s, %s)', (locationName, locationType,))
                dbcursor.execute('SELECT LAST_INSERT_ID()')
                dbcursorfetch = dbcursor.fetchall()
                
        retinfo['status'] = 'ok'
        retinfo['locationid'] = dbcursorfetch[0][0]
        
        return jsonify(retinfo)
    
@app.route('/api/editStudent', methods=['POST'])
def editStudent():
    if ensureLoggedIn(session):
        retinfo = {}
        
        studentid = request.json.get('studentid')
        
        try:
            deleteStudent = request.json.get('delete')
            if deleteStudent == 'true':
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('SELECT * FROM students WHERE studentid = %s', (studentid,))
                        dbcursorfetch = dbcursor.fetchall()
                        
                if len(dbcursorfetch) < 1:
                    retinfo['status'] = 'error'
                    retinfo['errorinfo'] = 'Student does not exist'
                    
                    return jsonify(retinfo)
                
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('DELETE FROM students WHERE studentid = %s', (studentid,))
                
                retinfo['status'] = 'ok'
                
                return jsonify(retinfo)
        except:
            pass
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM students WHERE studentid = %s', (studentid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Student does not exist'
            
            return jsonify(retinfo)
        
        studentName = request.json.get('name')
        studentGrade = request.json.get('grade')
        studentFloor = request.json.get('floor')
        studentCardid = request.json.get('cardid')
        studentImage = request.json.get('image')
        
        if checkNameLength(studentName) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a name with a valid length'
            
            return jsonify(retinfo)
        
        if checkGrade(studentGrade) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid grade within a valid range'
            
            return jsonify(retinfo)
        
        if checkCardidLength(studentCardid) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a card ID with a valid length'
            
            return jsonify(retinfo)
        
        dprint([studentid, studentName, studentGrade, studentFloor, studentCardid])
        
        if studentName == None or studentGrade == None or studentFloor == None or studentName == '' or studentGrade == '' or studentFloor == '':
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please fill in all of the required fields'
            
            return jsonify(retinfo)
                
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM students WHERE name = %s AND studentid != %s', (studentName, studentid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Name of student has already been taken'
            
            return jsonify(retinfo)
        
        if studentImage != None and studentImage != '':   
            if not studentImage.startswith('data:image/png;base64,iVBORw0KGgo'):
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please upload a valid png image'

                return jsonify(retinfo)

            if len(studentImage) > 2100000:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please upload an image that is less than 1.5MB'

                return jsonify(retinfo)
            
        else:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT image FROM students WHERE studentid = %s', (studentid,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            studentImage = dbcursorfetch[0][0]
            
        if studentCardid != None and studentCardid != '':
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT studentid FROM students WHERE cardid = %s', (studentCardid,))
                    dbcursorfetch = dbcursor.fetchall()

            if len(dbcursorfetch) > 0 and dbcursorfetch[0][0] != studentid:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Card ID has already been taken'

                return jsonify(retinfo)
        else:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT image FROM students WHERE studentid = %s', (studentid,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            studentCardid = dbcursorfetch[0][0]
        
        try: 
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT type, locationid FROM locations WHERE name = %s', (studentFloor,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            dprint(dbcursorfetch)

            if len(dbcursorfetch) < 1:
                dprint('de')
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please enter a valid floor name'

                return jsonify(retinfo)

            if dbcursorfetch[0][0] != 2:
                dprint('dl')
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Location selected is a destination'

                return jsonify(retinfo)
            
            studentFloorId = dbcursorfetch[0][1]
        except:
            dprint('dd')
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid floor name'

            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('UPDATE students SET name = %s, grade = %s, floorid = %s, cardid = %s, image = %s WHERE studentid = %s', (studentName, studentGrade, studentFloorId, studentCardid, studentImage, studentid,))
        
        retinfo['status'] = 'ok'
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
                
@app.route('/api/editUser', methods=['POST'])
def editUser():
    if ensureLoggedIn(session):
        retinfo = {}
        
        settingsEdit = request.json.get('settingsEdit')
        if settingsEdit == 'true':
            seTrue = True
            
            oid = getOidFromSession(session)
            userid = checkUserInformation("userid", oid)[0]
            
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT role FROM users WHERE userid = %s', (userid,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            userRoleId = dbcursorfetch[0][0]
        else:
            seTrue = False
            userid = request.json.get('userid')
        
        try:
            deleteUser = request.json.get('delete')
            if deleteUser == 'true':
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('SELECT * FROM users WHERE userid = %s', (userid,))
                        dbcursorfetch = dbcursor.fetchall()
                        
                if len(dbcursorfetch) < 1:
                    retinfo['status'] = 'error'
                    retinfo['errorinfo'] = 'User does not exist'
                    
                    return jsonify(retinfo)
                
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('DELETE FROM users WHERE userid = %s', (userid,))
                
                retinfo['status'] = 'ok'
                
                return jsonify(retinfo)
        except:
            pass
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM users WHERE userid = %s', (userid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'User does not exist'
            
            return jsonify(retinfo)
        
        userName = request.json.get('name')
        userEmail = request.json.get('email')
        userRole = request.json.get('role')
        userLocation = request.json.get('location')
        userPassword = request.json.get('password')
        
        if checkNameLength(userName) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a name with a valid length'
            
            return jsonify(retinfo)
        
        if checkEmailLength(userEmail) == False:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter an email with a valid length'
            
            return jsonify(retinfo)
        
        dprint([userName, userEmail, userRole, userLocation, userPassword])
        
        if userName == None or userEmail == None or (userRole == None and seTrue != True) or userLocation == None or userName == '' or userEmail == '' or (userRole == '' and seTrue != True) or userLocation == '':
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please fill in all of the required fields'
            
            return jsonify(retinfo)
                
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM users WHERE name = %s AND userid != %s', (userName, userid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Name of user has already been taken'
            
            return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT * FROM users WHERE email = %s AND userid != %s', (userEmail, userid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) > 0:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Email of user has already been taken'
            
            return jsonify(retinfo)
        
        if userPassword == None or userPassword == '':
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT password FROM users WHERE userid = %s', (userid,))
                    dbcursorfetch = dbcursor.fetchall()
                    
            userPassword = dbcursorfetch[0][0]
            
        else:
            userPassword = generateSHA256(userPassword)
            
        try:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('SELECT type, locationid FROM locations WHERE name = %s', (userLocation,))
                    dbcursorfetch = dbcursor.fetchall()
            
            userLocationId = dbcursorfetch[0][1]
        except:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Please enter a valid location'
            
            return jsonify(retinfo)
        
        if not seTrue:
            if userRole == 'admin':
                userRoleId = 1
            elif userRole == 'proctor':
                userRoleId = 2
            elif userRole == 'approver':
                userRoleId = 3
            else:
                retinfo['status'] = 'error'
                retinfo['errorinfo'] = 'Please enter a valid role'

                return jsonify(retinfo)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('UPDATE users SET name = %s, email = %s, role = %s, locationid = %s, password = %s WHERE userid = %s', (userName, userEmail, userRoleId, userLocationId, userPassword, userid,))
        
        retinfo['status'] = 'ok'
        
        return jsonify(retinfo)
    
@app.route('/api/searchStudents', methods=['POST'])
def searchStudents():
    if ensureLoggedIn(session):
        retinfo = {}
        
        searchFilter = request.json.get('searchFilter')
        
        dprint(searchFilter)
        
        sqlquery = "SELECT studentid, name, grade, cardid, floorid, disabledlocations FROM students WHERE 1 = 1 "
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
            strictNameFilter = str(searchFilter['strictname'])
            dprint(strictNameFilter)
            sqlquery += 'AND name = %s '
            sqlqueryvar.append(strictNameFilter)
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
                
        querySearchLimit = int(getSettingsValue('querySearchLimit'))
                
        retinfo['status'] = 'ok'
        retinfo['students'] = dbcursorfetch[:querySearchLimit]

        return jsonify(retinfo)   
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/searchUsers', methods=['POST'])
def searchUsers():
    if ensureLoggedIn(session):
        retinfo = {}
        
        searchFilter = request.json.get('searchFilter')
        
        dprint(searchFilter)
        
        sqlquery = "SELECT userid, name, email, role, locationid FROM users WHERE 1 = 1 "
        sqlqueryvar = []
        
        try:
            settingsEdit = str(searchFilter['settingsEdit'])
            if settingsEdit == 'true':
                oid = getOidFromSession(session)
                userid = checkUserInformation("userid", oid)[0]
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute('SELECT userid, name, email, role, locationid FROM users WHERE userid = %s', (userid,))
                        dbcursorfetch = dbcursor.fetchall()
                        
                retinfo['status'] = 'ok'
                retinfo['users'] = dbcursorfetch[0]
                
                return jsonify(retinfo)
        except KeyError:
            pass
                
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
            strictNameFilter = str(searchFilter['strictname'])
            dprint(strictNameFilter)
            sqlquery += 'AND name = %s '
            sqlqueryvar.append(strictNameFilter)
        except KeyError:
            pass
        
        try:
            emailFilter = str(searchFilter['email'])
            dprint(emailFilter)
            sqlquery += 'AND email = %s '
            sqlqueryvar.append(emailFilter)
        except KeyError:
            pass
        
        try:
            roleFilter = str(searchFilter['role'])
            dprint(roleFilter)
            sqlquery += 'AND role = %s '
            sqlqueryvar.append(roleFilter)
        except KeyError:
            pass
        
        try:
            locationFilter = str(searchFilter['location'])
            dprint(locationFilter)
            sqlquery += 'AND locationid = %s '
            sqlqueryvar.append(locationFilter)
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
                
        querySearchLimit = int(getSettingsValue('querySearchLimit'))
                
        retinfo['status'] = 'ok'
        retinfo['users'] = dbcursorfetch[:querySearchLimit]

        return jsonify(retinfo)   
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/getLocationInfo', methods=['POST'])    
def getLocationInfo():
    if ensureLoggedIn(session):
        retinfo = {}
        
        locationfilter = request.json.get('filters')
        
        sqlquery = 'SELECT locationid, name, type FROM locations WHERE 1 = 1 '
        sqlqueryvar = []
        
        try:
            idfilter = int(locationfilter['id'])
            sqlquery += 'AND locationid = %s '
            sqlqueryvar.append(idfilter)
        except KeyError:
            pass
        
        try:
            namefilter = str(locationfilter['name'])
            namekeywords = namefilter.split()
            for keyword in namekeywords:
                sqlquery += 'AND name LIKE %s '
                sqlqueryvar.append(f'%{keyword}%')
        except KeyError:
            pass
        
        try:
            typefilter = str(locationfilter['type'])
            sqlquery += 'AND type = %s '
            sqlqueryvar.append(typefilter)
        except KeyError:
            pass
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute(sqlquery, sqlqueryvar)
                dbcursorfetch = dbcursor.fetchall()
                
        querySearchLimit = int(getSettingsValue('querySearchLimit'))
                
        retinfo['status'] = 'ok'
        retinfo['locationinfo'] = dbcursorfetch[:querySearchLimit]
        
        return jsonify(retinfo)   
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/updateUserLocation', methods=['POST'])
def updateUserLocation():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        urin = checkUserInformation("userid", oid)
        if urin == None:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Not authorized to perform this action'
            
            return jsonify(retinfo)
        userid = urin[0]
        
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
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
        
    
@app.route('/api/getUserInfo', methods=['POST'])
def getUserInfo():
    if ensureLoggedIn(session):
        retinfo = {}
        
        oid = getOidFromSession(session)
        
        urin = checkUserInformation("userid, name, email, locationid", oid) 
        if urin == None:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Not authorized to perform this action'
            
            return jsonify(retinfo)
        userinfo = ["user"]
        userinfo += urin
        userinfo = [userinfo]
        
        dprint(userinfo)
        
        retinfo["status"] = 'ok'
        retinfo["userinfo"] = listToJson(userinfo)
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
    
@app.route('/api/getStudentInfo', methods=['POST'])
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
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
        
    
@app.route('/api/newPass', methods=['POST'])
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
        
        urin = checkUserInformation("userid, name, oid, email, role, locationid", oid)
        if urin == None:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'Not authorized to perform this action'
            
            return jsonify(retinfo)
        userinfo = urin
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
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
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
    
@app.route('/api/getStudentImage', methods=['POST'])
def getStudentImage():
    if ensureLoggedIn(session):
        retinfo = {}
        
        studentid = request.json.get('studentid')
                        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT image FROM students WHERE studentid = %s', (studentid,))
                dbcursorfetch = dbcursor.fetchall()
                
        if len(dbcursorfetch) < 1:
            retinfo['status'] = 'error'
            retinfo['errorinfo'] = 'imgerr'
            
            return jsonify(retinfo)
                
        retinfo['status'] = 'ok'
        retinfo['studentBase64Image'] = dbcursorfetch[0][0]
        
        return jsonify(retinfo)
    
    else:
        retinfo = {}
        
        retinfo['status'] = 'error'
        retinfo['errorinfo'] = 'Not authorized to perform this action'
        
        return jsonify(retinfo)
        
@app.route('/managePanel')
def managePanel():
    if ensureLoggedIn(session):
        return render_template('managePanel.html')
    else:
        return redirect('/')
    
@app.route('/passwordReset')
def passwordReset():
    return render_template('passwordReset.html')
    
@app.route('/settingsPanel')
def settingsPanel():
    if ensureLoggedIn(session):
        return render_template('settingsPanel.html')
    else:
        return redirect('/')

@app.route('/api/passwordReset', methods=['POST'])
def requestPasswordReset():
    email = request.json.get('email')
    
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute('SELECT userid FROM users WHERE email = %s', (email,))
            result = dbcursor.fetchall()
    
    if len(result) < 1:
        delaySeconds = random.randint(45, 65)
        time.sleep(delaySeconds / 10)
        return jsonify({'status': 'ok'})
    
    userid = result[0][0]
    token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=32))
    expireTime = currentDatetime() + timedelta(hours=1)
    
    with dbConnect() as connection:
        with connection.cursor() as dbcursor:
            dbcursor.execute('INSERT INTO passwordreset (userid, token, expireTime) VALUES (%s, %s, %s)', (userid, token, expireTime))
    
    reset_link = f"http://localhost:8080/resetPassword?token={token}"
    email_body = f"Click the link to reset your password: {reset_link}"
    
    if sendEmail('Password Reset Request', email_body, email):
        delaySeconds = random.randint(0, 20)
        time.sleep(delaySeconds / 10)
        return jsonify({'status': 'ok'})
    else:
        delaySeconds = random.randint(0, 20)
        time.sleep(delaySeconds / 10)
        return jsonify({'status': 'error', 'errorinfo': 'Failed to send email'})

@app.route('/resetPassword')
def resetPassword():
        token = request.args.get('token')
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT userid FROM passwordreset WHERE token = %s AND expireTime > %s', (token, currentDatetime()))
                result = dbcursor.fetchall()

        if len(result) < 1:
            return 'Invalid or expired password reset link', 400
        
        userid = result[0][0]
                        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT name FROM users WHERE userid = %s', (userid,))
                result = dbcursor.fetchall()
                
        username = result[0][0]
        
        return render_template('newPassword.html', token=token, userName=username)
    
@app.route('/api/resetNewPassword', methods=['POST'])
def resetNewPassword():
        token = request.json.get('token')
        newPassword = request.json.get('newPassword')
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('SELECT userid FROM passwordreset WHERE token = %s AND expireTime > %s', (token, currentDatetime()))
                result = dbcursor.fetchall()
        
        if len(result) < 1:
            return jsonify({'status': 'error', 'errorinfo': 'Invalid or expired token'})
        
        userid = result[0][0]
        hashed_password = generateSHA256(newPassword)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute('UPDATE users SET password = %s WHERE userid = %s', (hashed_password, userid))
                dbcursor.execute('DELETE FROM passwordreset WHERE token = %s', (token,))
        
        return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=8080, host="0.0.0.0")