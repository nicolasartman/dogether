// var bar = require('./components/MyStuff/baz.js');
require('./components/MyStuff/hello.js');
let myName = 'person man';
console.log('yoo hoo ' + myName);

var CodeEditor = require('./components/MyStuff/codeEditor.js');
require('codemirror/mode/javascript/javascript');


React.render(React.createElement(CodeEditor), document.getElementById('app'));
