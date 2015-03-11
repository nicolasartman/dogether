// console.log('testing');

var Hello = React.createClass({
  render: function() {
    return (
    	/* jshint ignore:start */
      <div className="hello">
        <h1>Our react component says...</h1>
        <p>
					HEYOOO
				</p>
      </div>
      /* jshint ignore:end */
    );
  }
});

React.render(
  <Hello />,
  document.getElementById('app')
);
