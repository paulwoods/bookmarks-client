import React, {Component} from 'react';
import './App.css';

class App extends Component {

    static api = 'http://localhost:8080';

    state = {
        bookmarks: []
    };

    constructor() {

        super();

        this.handleUpVote = this.handleUpVote.bind(this);
        this.handleDownVote = this.handleDownVote.bind(this);
        this.handleAddBookmark = this.handleAddBookmark.bind(this);
    }

    componentDidMount() {

        fetch(App.api + '/bookmark')
            .then(response => response.json())
            .then(json => this.setState({bookmarks: json}))
            .catch(error => console.error(error));
    }

    render() {
        return (
            <div>
                <Bookmarks
                    bookmarks={this.state.bookmarks}
                    onUpVote={this.handleUpVote}
                    onDownVote={this.handleDownVote}
                />
                <AddBookmark
                    onAddBookmark={this.handleAddBookmark}
                />
            </div>
        );
    }

    replaceBookmark(bookmarks, bookmark) {

        // find the bookmark in state, and update its votes

        this.setState((prevState, props) => {

            const pos = bookmarks.findIndex(b => b.id === bookmark.id);
            if (-1 !== pos) {
                bookmarks.splice(pos, 1, bookmark);
            }

            return prevState
        });
    }

    handleUpVote(bookmark) {
        fetch(App.api + '/bookmark/' + bookmark.id + '/up', {method: 'POST', mode: 'cors'})
            .then(response => response.json())
            .then(bookmark => this.replaceBookmark(this.state.bookmarks, bookmark))
            .catch(error => console.error(error));
    }

    handleDownVote(bookmark) {
        fetch(App.api + '/bookmark/' + bookmark.id + '/down', {method: 'POST', mode: 'cors'})
            .then(response => response.json())
            .then(bookmark => this.replaceBookmark(this.state.bookmarks, bookmark))
            .catch(error => console.error(error));
    }

    handleAddBookmark(name, url) {
        console.log('handleAddBookmark', name, url);

        const body = JSON.stringify({
            name: name,
            url: url
        });

        fetch(App.api + '/bookmark/', {
            method: 'POST',
            mode: 'cors',
            body: body,
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
            .then(response => response.json())
            .then(bookmark => {
                let bookmarks = this.state.bookmarks.slice();
                bookmarks.push(bookmark);
                this.setState({bookmarks: bookmarks});
            })
            .catch(error => console.error(error));
    }

}

class Bookmarks extends Component {

    render() {

        const bookmarks = this.props.bookmarks.map((bookmark) =>
            <Bookmark
                key={bookmark.name}
                bookmark={bookmark}
                onUpVote={this.props.onUpVote}
                onDownVote={this.props.onDownVote}
            />
        );

        return (
            <ul style={{'listStyle': 'none'}}>{bookmarks}</ul>
        );
    }
}

class Bookmark extends Component {

    constructor(props) {

        super(props);

        this.handleUpVote = this.handleUpVote.bind(this);
        this.handleDownVote = this.handleDownVote.bind(this);
    }

    handleUpVote(e) {
        e.preventDefault();
        this.props.onUpVote(this.props.bookmark);
    }

    handleDownVote(e) {
        e.preventDefault();
        this.props.onDownVote(this.props.bookmark);
    }

    render() {
        return (
            <li key={this.props.bookmark.name}>
                <i className='fas fa-link'/>
                &nbsp;
                <a target='_blank' href={this.props.bookmark.url}>{this.props.bookmark.name}</a>
                &nbsp;
                <a onClick={this.handleUpVote}><i className='far fa-thumbs-up'/></a>
                &nbsp;
                {this.props.bookmark.votes}
                &nbsp;
                <a onClick={this.handleDownVote}><i className='far fa-thumbs-down'/></a>
            </li>
        );

    }
}

class AddBookmark extends Component {

    constructor(props) {
        super(props);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        this.props.onAddBookmark(this.refs.name.value, this.refs.url.value);
    }

    render() {
        return (
            <form onSubmit={this.handleFormSubmit}>
                <div className='form-group'>
                    <label htmlFor='name'>Name</label>
                    <input type='text' className='form-control' id='name' ref='name'/>
                    <small id='nameHelp' className='form-text text-muted'>Enter a name for the bookmark</small>
                </div>
                <div className='form-group'>
                    <label htmlFor='url'>URL</label>
                    <input type='url' className='form-control' id='url' ref='url'/>
                    <small id='nameHelp' className='form-text text-muted'>http://www.example.com</small>
                </div>
                <button type='submit' className='btn btn-primary'>Add Bookmark</button>
            </form>
        );
    }

}

export default App;
