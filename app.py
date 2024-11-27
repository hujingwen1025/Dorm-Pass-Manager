from flask import *
import mysql.connector

app = Flask(__name__)

@app.route('/studentInfoDisplay')
def studentInfoDisplay():
    return render_template('studentInfoDisplay.html')

@app.route('/studentInfoFrame')
def studentInfoFrame():
    return render_template('studentInfoFrame.html')

if __name__ == '__main__':
    app.run()