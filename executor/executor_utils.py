import docker
import os
import shutil
import uuid
from docker.errors import *

client = docker.from_env()

IMAGE_NAME = 'harperg/code_judge'
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
TEMP_BUILD_DIR = '%s/tmp' % CURRENT_DIR

SOURCE_FILE_NAMES = {
    "java" : "Example.java",
    'python' : 'example.py'
}

BINARY_NAMES = {
    "java" : "Example",
    'python' : 'example.py'
}

BUILD_COMMANDS = {
    "java" : "javac",
    "python" : "python"
}

EXECUTE_COMMANDS = {
    "java" : "java",
    "python" : "python"
}

def load_image():
    try:
        client.images.get(IMAGE_NAME)     #locally looking for image
    except ImageNotFound:
        print 'Image not found locally, loading from docker hub.'
        client.images.pull(IMAGE_NAME)    #pulling from docker hub
    except APIError:
        print 'Docker hub not accessible.'
        return
    print 'Image: [%s] loaded successfully.' % IMAGE_NAME

def build_and_run(lang, code):
    result = {'build': None, 'run': None, 'error': None}
    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = TEMP_BUILD_DIR + '/' + str(source_file_parent_dir_name)   #where user code is write to
    source_file_guest_dir = '/test/' + str(source_file_parent_dir_name)

    print(source_file_host_dir)
    make_dir(source_file_host_dir)

    with open('%s/%s' % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)

    try:
        client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print 'User code built'
        result['build'] = 'Code built successfully'
    except ContainerError as e:
        print 'Building failed'
        result['build'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    try:
        log = client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print 'Use code executed'
        result['run'] = log
    except ContainerError as e:
        print 'Execution failed'
        result['run'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    shutil.rmtree(source_file_host_dir)
    return result

def make_dir(dir):
    try:
        os.mkdir(dir)
        print 'temp build directory [%s] created' % dir
    except OSError:
        print 'temp build directory [%s] existed' % dir
