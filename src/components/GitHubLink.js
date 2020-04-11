import React from 'react';

// Material UI Components
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

// Images
import GITHUB from '../assets/img/GitHubWhite.png';

const useStyles = makeStyles((theme) => ({
    github: {
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        color: 'var(--text-color)',
        paddingTop: 20,
    },
    img: {
        width: 40,
        height: 40,
        margin: 'auto',
    },
}));

function GitHubLink(props) {
    const classes = useStyles();

    return (
        <a href="https://github.com/olros/snakk" target="_noopener" className={classes.github}>
            <img src={GITHUB} alt="Github" className={classes.img} />
            <Typography variant="subtitle1">@olros</Typography>
        </a>
    );
}

export default GitHubLink;