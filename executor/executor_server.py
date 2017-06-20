from flask import Flask
from flask import jsonify
from flask import request

app = Flask(__name__)

@app.route('/')
def greeting():
    return 'Hello world'


@app.route('/build_and_run', methid=['POST'])
def build_and_run():
    data = json.loads(request.data)
    if 'code' not in data or 'lang' not in data:
        return 'missing data'
    code = data['code']
    lang = data['lang']
    print 'API go called with code %s in %s' % (code, lang)

if __name__ == '__main__':
    app.run(debug=True)
