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

debug = False

CLIENT_ID = '64141594-9d10-4ae2-82c7-43a73eef5e20'
CLIENT_SECRET = 'xca8Q~AGugkyWFFgihOw-nBwYV1hnrSilLrFXaF5'
AUTHORITY = 'https://login.microsoftonline.com/common'  # "common" allows users from any organization
REDIRECT_URI = 'http://localhost:8080/microsoftLoginCallback'
SCOPE = ["User.Read"]  # Read basic user profile

def dprint(text):
    if debug:
        dprint(text)

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
        dprint(userInfo)
        session['msoid'] = msoid
        if userInfo == None:
            return render_template('userNotRegistered.html', email = msUserInfo["preferred_username"])
        session['login'] = True
        return redirect('/passCatalogue')
    else:
        return f'Error: {result.get("error_description")}', 400
    
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
        
        userinfo = checkUserInformation("userid, name, msoid, email, role, locationid", session.get('msoid'))
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
                    
            if stampposition != 0 and stampposition != None:
                with dbConnect() as connection:
                    with connection.cursor() as dbcursor:
                        dbcursor.execute(f"SELECT {timepositions[stampposition - 1]}, {timepositions[stampposition]} FROM passes WHERE passid = %s", (passid,))
                        stamptime = dbcursor.fetchall()
                
                stamptime = stamptime[0]
                elapsedtime = str(stamptime[1] - stamptime[0]).split(':')
                for i in range(len(elapsedtime)):
                    elapsedtime[i] = int(elapsedtime[i])
                    
                retinfo["elapsedtime"] = elapsedtime
        
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
        
        userinfo = checkUserInformation("userid, name, msoid, email, role, locationid", session.get('msoid'))
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
                    sqlquery += "AND destinationid = %s"
                    sqlqueryvar += str(userlocation)
                else:
                    sqlquery += "AND floorid = %s"
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
            nullstatus = ['AND fleavetime IS NULL ', 'AND fleavetime IS NOT NULL AND darrivetime IS NULL', 'AND darrivetime IS NOT NULL AND dleavetime IS NULL', 'AND dleavetime IS NOT NULL AND farrivetime IS NULL']
            print(nullstatus[statusfilter])
            sqlquery += nullstatus[statusfilter]
        except KeyError:
            pass
        
        try:
            searchfilter = str(searchfilters['search'])
            searchkeywords = searchfilter.split()
            dprint(searchkeywords)
            for keyword in searchkeywords:
                dprint(keyword)
                sqlquery += 'AND keywords LIKE %s'
                sqlqueryvar.append(f'%{keyword}%')
        except KeyError:
            pass
        
        dprint(sqlquery)
        dprint(sqlqueryvar)
        
        with dbConnect() as connection:
            with connection.cursor() as dbcursor:
                dbcursor.execute(sqlquery, sqlqueryvar)
                dprint('execed')
                print(dbcursor.statement)
                dbcursorfetch = dbcursor.fetchall()
        
        retinfo['status'] = 'ok'
        retinfo['students'] = dbcursorfetch
        dprint(dbcursorfetch)
        return jsonify(retinfo)   
    
@app.route('/updateUserLocation', methods=['POST'])
def updateUserLocation():
    if ensureLoggedIn(session):
        retinfo = {}
        
        userid = checkUserInformation("userid", session.get('msoid'))[0]
        
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
        
        userinfo = ["user"]
        userinfo += checkUserInformation("userid, name, email, locationid", session.get('msoid')) 
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
                
                print('pa')
                print(dbcursorfetch)
        
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
        
        userinfo = checkUserInformation("userid, name, msoid, email, role, locationid", session.get('msoid'))
        userid = userinfo[0]
        userlocationid = userinfo[5]
                
        try:
            with dbConnect() as connection:
                with connection.cursor() as dbcursor:
                    dbcursor.execute('INSERT INTO passes (studentid, floorid, destinationid) VALUES (%s, %s, %s)', (studentid, userlocationid, destinationid,))
                                        
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

@app.route('/passCatalogue')
def passCatalogue():
    if ensureLoggedIn(session):
        return render_template('passCatalogue.html')
    else:
        return redirect('/')

if __name__ == '__main__':
    app.run(port=8080, host="localhost")