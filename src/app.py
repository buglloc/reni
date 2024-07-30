import os
import json

from flask import Flask, render_template, request, Response
from pyparsing import ParseException

from gixy.core.regexp import Regexp


app = Flask(__name__)


@app.template_filter('autoversion')
def autoversion_filter(filename):
    fullpath = os.path.join(os.path.realpath(__file__), '..', filename[1:])
    fullpath = os.path.realpath(fullpath)
    try:
        timestamp = str(os.path.getmtime(fullpath))
    except OSError:
        return filename
    newfilename = "{0}?v={1}".format(filename, timestamp)
    return newfilename


@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['Content-Security-Policy'] = "default-src 'none'; script-src 'self' 'unsafe-eval' yastatic.net; style-src 'self' 'unsafe-inline' yastatic.net; img-src 'self'; font-src yastatic.net; connect-src 'self';"
    return response


@app.route('/gen', methods=['POST'])
def validate():
    body = request.get_json()
    regex = body.get('regex', '')
    danger = body.get('danger', 'a')[:1]

    try:
        regex = Regexp(regex)
        values = regex.generate(char=danger, anchored=True)
        result = {'status': 'ok', 'result': [x for x in values]}
    except Exception as e:
        result = {'status': 'failed', 'error': 'Error occurred: {}'.format(str(e))}

    return Response(response=json.dumps(result), status=200, mimetype='application/json')


@app.route('/')
def index():
    return render_template('index.html', regex=request.args.get('regex', ''), danger=request.args.get('danger', '/'))

if __name__ == '__main__':
    app.run()
