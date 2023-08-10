import 'bootstrap/dist/css/bootstrap.css';
import './chat/chat.css';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import buildClient from '../helpers/buildClient';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    const socketid = useMemo(() => uuidv4(), []);

    return (
        <div id='page'>
            <Header currentUser={currentUser} />
            <div className='container'>
                <Component currentUser={currentUser} id={socketid} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentUser');
    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }
    return {
        pageProps,
        currentUser: data.currentUser,
    };
};

export default AppComponent;
