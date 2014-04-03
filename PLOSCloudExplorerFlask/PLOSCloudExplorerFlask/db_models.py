import flask
from flask.ext.sqlalchemy import SQLAlchemy
from pgconn import pgconn

app = flask.Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = pgconn
db = SQLAlchemy(app)