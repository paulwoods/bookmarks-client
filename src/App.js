import React, {Component} from 'react';
import './App.css';
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

class App extends Component {

    state = {
        bookmarks: []
    };

    api = 'https://mrpaulwoods.org/api';

    constructor(props) {
        super(props);

        this.handleUpVote = this.handleUpVote.bind(this);
        this.handleDownVote = this.handleDownVote.bind(this);
        this.replaceBookmark = this.replaceBookmark.bind(this);
    }

    componentDidMount() {
        fetch(this.api + '/bookmark', {method: 'GET', mode: 'cors'})
            .then(response => response.json())
            .then(json => this.setState({bookmarks: json}))
            .catch(error => console.error(error));
    }

    render() {

        const bookmarks = this.state.bookmarks.map(bookmark => {
            return (
                <TableRow key={bookmark.id} hover={true}>
                    <TableCell density="dense"><a target="_blank" href={bookmark.url}>{bookmark.name} [{bookmark.votes}]</a></TableCell>
                    <TableCell><Icon id={bookmark.id} onClick={this.handleUpVote}>thumb_up</Icon></TableCell>
                    <TableCell><Icon id={bookmark.id} onClick={this.handleDownVote}>thumb_down</Icon></TableCell>
                </TableRow>
            );
        });

        return (
            <div>
                <Reboot/>

                <AppBar position="static">
                    <Toolbar>
                        <IconButton color="inherit" aria-label="Menu">
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="title" color="inherit">
                            Bookmarks
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>

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

            </div>
        );
    }

    handleUpVote(e) {
        const id = e.target.id;
        fetch(this.api + '/bookmark/' + id + '/up', {method: 'POST', mode: 'cors'})
            .then(response => response.json())
            .then(bookmark => this.replaceBookmark(this.state.bookmarks, bookmark))
            .catch(error => alert(error));
    }

    handleDownVote(e) {
        const id = e.target.id;
        fetch(this.api + '/bookmark/' + id + '/down', {method: 'POST', mode: 'cors'})
            .then(response => response.json())
            .then(bookmark => this.replaceBookmark(this.state.bookmarks, bookmark))
            .catch(error => alert(error));
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

}

export default App;
