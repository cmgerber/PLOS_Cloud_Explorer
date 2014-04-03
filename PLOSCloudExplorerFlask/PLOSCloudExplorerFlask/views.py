from PLOSCloudExplorerFlask import app
import flask
from flask import request
from pgconn import API_KEY, secret_key
from db_models import db

# homepage
@app.route('/')
def home():
    return flask.render_template('home.html', home=True)
