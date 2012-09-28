# ** MODIFY THIS FILE AS REQUIRED **
# ** ADD CUSTOM BUILD- & TEST-EXECUTION-COMMANDS HERE **
#
# Building & testing for development and CI environment
#
# Following binaries need to be installed and available in your PATH:
#
#   * jsdoc
#   * jshint
#   * phantomjs
#   * jscoverage-server
#   * node
#
# CI-Tools (https://github.com/uxebu/ci-tools) need to be installed in:
#
#   /opt/ci-tools
#
# The Jenkins-CI environment is executing the task `ci-run`:
#
#   make ci-run

ifndef TEST_RUNNER
    # CHANGE HERE, IF THE DEFAULT TEST-RUNNER IS SOMEWHERE ELSE
    TEST_RUNNER=test/runner.html
    TEST_RUNNER_COMPARE=test/runner-compare.html
    TEST_RUNNER_QC=test/runner-qc.html
    TEST_RUNNER_BUILD=test/runner-build.html
endif

ifndef WORKSPACE
    WORKSPACE=${CURDIR}
endif

ifndef PROJECT_NAME
    PROJECT_NAME = $(shell basename ${WORKSPACE})
endif

CURRENT_USER = $(shell whoami)

ifndef BASE_URL
    BASE_URL=http://localhost/${CURRENT_USER}/${PROJECT_NAME}
endif

ifdef JOB_URL
    # jenkins env URL params end with "/"
    BASE_URL=${JOB_URL}ws
endif

ifdef GIT_BRANCH
	SUB_DIR=/${shell echo ${GIT_BRANCH} | sed "s/origin\///"}
endif

# You can install the CI-Tools on your machine: https://github.com/uxebu/ci-tools
ifndef CI_TOOLS_DIR
    CI_TOOLS_DIR=/opt/ci-tools
endif

ifndef TEMP_DIR
    TEMP_DIR=${WORKSPACE}/tmp
endif

ifndef DIST_DIR
    DIST_DIR=${WORKSPACE}/dist
endif

CLOSURE=java -jar lib/closure/compiler.jar
CLOSURE_AMD=${CLOSURE} \
  --transform_amd_modules \
  --process_common_js_modules \
  --common_js_module_path_prefix src \
  --output_wrapper '(function __bonsaiRunnerCode__(){%output%}());'
CLOSURE_FINALIZE=${CLOSURE}
CLOSURE_PRETTY=${CLOSURE} --formatting PRETTY_PRINT --compilation_level WHITESPACE_ONLY

default: build

jshint: mktemp
	- jshint ${WORKSPACE}/src/ --config config/jshint.json > ${TEMP_DIR}/jshint-report.txt

coverage: mktemp
	${CI_TOOLS_DIR}/bin/coverage_phantom.sh ${TEST_RUNNER} ${WORKSPACE}

test: mktemp
	phantomjs --load-plugins=yes ${CI_TOOLS_DIR}/script/phantom_runner.js ${BASE_URL}/${TEST_RUNNER_BUILD} ${TEMP_DIR} 1 jasmine | grep -q "Testcase passed"
	phantomjs --load-plugins=yes ${CI_TOOLS_DIR}/script/phantom_runner.js ${BASE_URL}/${TEST_RUNNER} ${TEMP_DIR} 0 jasmine
	phantomjs --load-plugins=yes ${CI_TOOLS_DIR}/script/phantom_runner.js ${BASE_URL}/${TEST_RUNNER_COMPARE} ${TEMP_DIR} 0 jasmine
	phantomjs --load-plugins=yes ${CI_TOOLS_DIR}/script/phantom_runner.js ${BASE_URL}/${TEST_RUNNER_QC} ${TEMP_DIR} 0 qc

test-phantom: mktemp
	phantomjs test/phantom-runner-jasmine.js test/runner.html

syntux-diff: mktemp
	${CI_TOOLS_DIR}/bin/syntux_diff.sh ${WORKSPACE}/src ${TEMP_DIR}

profile: mktemp
	cd ${WORKSPACE}/example/profiling && npm install
	- ${WORKSPACE}/example/profiling/run.js \
		-b ${BUILD_NUMBER} \
		-d 10000 \
		-e ${BASE_URL}/test/bonsai_executor_src.html \
		-j ${JOB_NAME} \
		-r http://riak.ux:8098/riak/profile \
		${WORKSPACE}/test/profile \

doc: mkjsdoc
	jsdoc -r -d ${WORKSPACE}/jsdoc${SUB_DIR} ${WORKSPACE}/src || true

build: clean mkdist
	${CLOSURE_AMD} --common_js_entry_module bootstrapper/_build/common.js \
		src/bootstrapper/_build/common.js \
			`find src -name '*.js' -not -path 'src/bootstrapper/_dev/*' -not -path 'src/bootstrapper/_build/*' -not -path 'src/bootstrapper/context/socketio/*' -not -path 'src/bootstrapper/context/node/*'` | ${CLOSURE_PRETTY} > ${DIST_DIR}/bonsai.js
	echo "/*" > ${DIST_DIR}/bonsai.min.js
	cat ${WORKSPACE}/LICENSE >> ${DIST_DIR}/bonsai.min.js
	echo "*/" >> ${DIST_DIR}/bonsai.min.js
	cat ${DIST_DIR}/bonsai.js | ${CLOSURE_FINALIZE} >> ${DIST_DIR}/bonsai.min.js

preview-bundle: build
	mkdir -p ${TEMP_DIR}/preview-bundle/lib
	mkdir -p ${TEMP_DIR}/preview-bundle/example
	mkdir -p ${TEMP_DIR}/preview-bundle/dist
	cp -R example/library ${TEMP_DIR}/preview-bundle/example
	- rm ${TEMP_DIR}/preview-bundle/example/library/movies/assets/*.mp4
	- rm ${TEMP_DIR}/preview-bundle/example/library/movies/assets/*.m4v
	- rm ${TEMP_DIR}/preview-bundle/example/library/movies/assets/*.ogv
	cp -R dist/*.min.js ${TEMP_DIR}/preview-bundle/dist
	cp -R lib/requirejs ${TEMP_DIR}/preview-bundle/lib
	cd ${TEMP_DIR} && tar czf bonsai-preview.tgz preview-bundle/

mktemp:
	mkdir -p ${TEMP_DIR}

mkdist:
	mkdir -p ${DIST_DIR}

mkjsdoc:
	mkdir -p ${WORKSPACE}/jsdoc

clean:
	rm -rf ${TEMP_DIR} ${DIST_DIR}

ci-run: clean build test coverage syntux-diff doc jshint profile
