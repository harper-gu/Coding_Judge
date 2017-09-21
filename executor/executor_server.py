from flask import Flask
from flask import jsonify
from flask import request
import json
import executor_utils as eu

app = Flask(__name__)

@app.route('/')
def greeting():
    return 'Hello world'


@app.route('/build_and_run', methods=['POST'])
def build_and_run():
    #print('executor got payload: %s', request.data)
    data = json.loads(request.data)
    if 'code' not in data or 'lang' not in data:
        return 'missing data'
    code = data['code']
    lang = data['lang']
    print 'API go called with code %s in %s' % (code, lang)

    result = eu.build_and_run(lang, code)
    return json.dumps(result)


if __name__ == '__main__':
    eu.load_image()
    app.run(debug=True)
