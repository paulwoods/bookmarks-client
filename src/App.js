import React, {Component} from 'react';
import {BrowserRouter as Router, Redirect, Route} from 'react-router-dom';
import Reboot from 'material-ui/Reboot';
import Icon from 'material-ui/Icon';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Table, {TableBody, TableCell, TableHead, TableRow} from 'material-ui/Table';
import Paper from 'material-ui/Paper';

import './App.css';

///////////////////////////////////////////////////////////////////////////////

function handleErrors(response) {
    if (response.ok) {
        return response;
    } else {
        throw Error(response.statusText);
    }
}

///////////////////////////////////////////////////////////////////////////////

class App extends Component {

    state = {
        api: 'http://localhost:8080',
        // api: 'https://mrpaulwoods.org/api',
        token: null
    };

    constructor(props) {
        super(props);
        this.handleToken = this.handleToken.bind(this);
        this.isTokenValid = this.isTokenValid.bind(this);
    }

    isTokenValid() {
        return this.state.token == null;
    }

    handleToken(token) {
        this.setState({token: token});
    }

    render() {
        return (
            <div>

                <Router>

                    <div>

                        {
                            this.isTokenValid() ? (<Redirect to='/login'/>) : null
                        }

                        <Reboot/>

                        <div>

                            <Route exact path="/" render={() => (
                                <Main api={this.state.api} token={this.state.token} onSetToken={this.handleToken}/>
                            )}/>

                            <Route exact path="/login" render={() => (
                                <Login api={this.state.api} token={this.state.token} onSetToken={this.handleToken}/>
                            )}/>

                        </div>

                    </div>

                </Router>

            </div>
        );
    }

}

///////////////////////////////////////////////////////////////////////////////

class Main extends Component {

    render() {

        return (
            <div>
                <TitleBar onSetToken={this.props.onSetToken}/>
                <Bookmarks api={this.props.api} token={this.props.token}/>
            </div>
        );
    }

}

///////////////////////////////////////////////////////////////////////////////

class TitleBar extends Component {

    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        this.props.onSetToken(null);
    }

    render() {

        return (
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" aria-label="Menu">
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="title" color="inherit">
                        Bookmarks
                    </Typography>
                    <Button color="inherit" onClick={this.handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
        );
    }
}

///////////////////////////////////////////////////////////////////////////////

class Bookmarks extends Component {

    state = {
        bookmarks: []
    };

    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.handleReplaceBookmark = this.handleReplaceBookmark.bind(this);
    }

    componentDidMount() {
        this.loadData(this.props.token)
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps.token);
    }

    loadData(token) {

        if (token == null) {
            return;
        }

        fetch(
            this.props.api + '/bookmark',
            {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            })

            .then(handleErrors)
            .then(response => response.json())
            .then(json => this.setState({bookmarks: json}))
            .catch(error => console.error(error));

    }

    handleReplaceBookmark(bookmark) {

        // find the bookmark in state, and update its votes

        this.setState((prevState, props) => {

            const pos = this.state.bookmarks.findIndex(b => b.id === bookmark.id);
            if (-1 !== pos) {
                this.state.bookmarks.splice(pos, 1, bookmark);
            }

            return prevState;
        });
    }

    render() {

        const bookmarks = this.state.bookmarks.map(bookmark => {
            return <Bookmark key={bookmark.id} bookmark={bookmark} api={this.props.api} token={this.props.token} onReplaceBookmark={this.handleReplaceBookmark}/>
        });

        return (
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Up Vote</TableCell>
                            <TableCell>Down Vote</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookmarks}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}

///////////////////////////////////////////////////////////////////////////////

class Bookmark extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <TableRow key={this.props.bookmark.id} hover={true}>
                <TableCell density="dense">
                    <a target="_blank" href={this.props.bookmark.url}>{this.props.bookmark.name} [{this.props.bookmark.votes}]</a>
                </TableCell>
                <TableCell>
                    <UpVote bookmark={this.props.bookmark}
                            api={this.props.api}
                            token={this.props.token}
                            onReplaceBookmark={this.props.onReplaceBookmark}/>
                </TableCell>
                <TableCell>
                    <DownVote bookmark={this.props.bookmark}
                              api={this.props.api}
                              token={this.props.token}
                              onReplaceBookmark={this.props.onReplaceBookmark}/>
                </TableCell>
            </TableRow>
        );
    }
}

///////////////////////////////////////////////////////////////////////////////

class UpVote extends Component {

    constructor(props) {
        super(props);
        this.handleUpVote = this.handleUpVote.bind(this);
    }

    handleUpVote(e) {
        const id = e.target.id;
        fetch(this.props.api + '/bookmark/' + id + '/up', {
            method: 'POST', mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        })
            .then(handleErrors)
            .then(response => response.json())
            .then(bookmark => this.props.onReplaceBookmark(bookmark))
            .catch(error => alert(error));
    }

    render() {
        return (
            <Icon id={this.props.bookmark.id} onClick={this.handleUpVote}>thumb_up</Icon>
        )
    }

}

///////////////////////////////////////////////////////////////////////////////

class DownVote extends Component {

    constructor(props) {
        super(props);
        this.handleDownVote = this.handleDownVote.bind(this);
    }

    handleDownVote(e) {
        const id = e.target.id;
        fetch(this.props.api + '/bookmark/' + id + '/down', {
            method: 'POST', mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.props.token
            }
        })
            .then(handleErrors)
            .then(response => response.json())
            .then(bookmark => this.props.onReplaceBookmark(bookmark))
            .catch(error => alert(error));
    }

    render() {
        return (
            <Icon id={this.props.bookmark.id} onClick={this.handleDownVote}>thumb_down</Icon>
        )
    }

}

///////////////////////////////////////////////////////////////////////////////

class Login extends Component {

    state = {
        username: 'mr.paul.woods@gmail.com',
        password: 'abcd1234'
    };

    constructor(props) {
        super(props);
        this.handleChangeUsername = this.handleChangeUsername.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleChangeUsername(e) {
        this.setState({username: e.target.value})
    }

    handleChangePassword(e) {
        this.setState({password: e.target.value})
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const body = {
            username: this.state.username,
            password: this.state.password
        };

        fetch(this.props.api + '/login', {method: 'post', mode: 'cors', body: JSON.stringify(body)})
            .then(handleErrors)
            .then(response => response.json())
            .then(json => this.props.onSetToken(json.token))
            .catch(error => console.error(error));
    }

    render() {
        return (
            <div>

                {
                    (this.props.token != null) ? (<Redirect to='/'/>) : null
                }

                <form onSubmit={this.handleFormSubmit}>
                    <div>
                        username:
                        <input type="text" value={this.state.username} onChange={this.handleChangeUsername}/>
                    </div>

                    <div>
                        password:
                        <input type="password" value={this.state.password} onChange={this.handleChangePassword}/>
                    </div>

                    <div>
                        <input type="submit" value="login"/>
                    </div>
                </form>

            </div>
        );

    }

}

export default App;
