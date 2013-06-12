build:
	browserify -t debowerify -t deglobalify test/test.js -o test/bundle.js
