var Comment = React.createClass({
	rawMarkup: function () {
		var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
		return {__html: rawMarkup};
	},
	render: function () {
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		);
	}
});

var CommentList = React.createClass({
	render: function () {
		var commentNodes = this.props.data.map(function (comment) {
			return (
				<Comment author={comment.author} key={comment.id}>
					{comment.text}
				</Comment>
			);
		});
		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

var CommentForm = React.createClass({
	getInitialState: function () {
		return {author: '', text: ''};
	},
	handleAuthorChange: function (e) {
		this.setState({author: e.target.value});
	},
	handleTextChange: function (e) {
		this.setState({text: e.target.value});
	},
	handleSubmit: function (e) {
		e.preventDefault();
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		if (!text || !author) {
			return;
		}
		this.props.onCommentSubmit({author: author, text: text});
		this.setState({author: '', text: ''});
	},
	render: function () {
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="Your name"
					value={this.state.author}
					onChange={this.handleAuthorChange}
				/>
				<input
					type="text"
					placeholder="Say something..."
					value={this.state.text}
					onChange={this.handleTextChange}
				/>
				<input type="submit" value="Post" />
			</form>
		);
	}
});

var CommentDOAFactory = function (url) {
	return {
		all: function (success, error) {
			return $.ajax({
				url: url,
				dataType: 'json',
				type: 'GET',
				cache: false,
				success: success,
				error: error
			})
		},
		create: function (comment, success, error) {
			return $.ajax({
				url: url,
				dataType: 'json',
				type: 'POST',
				data: comment,
				success: success,
				error: error
			})
		}
	};
};

var CommentBox = React.createClass({
	CommentDOA: function () {return CommentDOAFactory(this.props.url)},
	loadCommentsFromServer: function () {
		this.CommentDOA().all(function (data) {
			this.setState({data: data});
		}.bind(this))
	},
	handleCommentSubmit: function (comment) {
		this.CommentDOA().create(comment, function (data) {
			this.setState({data: data});
		}.bind(this));
	},
	getInitialState: function () {
		return {data: []};
	},
	componentDidMount: function () {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	render: function () {
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data} />
				<CommentForm onCommentSubmit={this.handleCommentSubmit} />
			</div>
		);
	}
});

ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000} />,
	document.getElementById('content')
);
