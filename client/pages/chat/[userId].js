import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import moment from 'moment';
import { useRequest } from '../../hooks/useRequest';

const ChatWindow = ({ data, currentUser, id }) => {
    const socket = io('/chat', {
        reconnection: true,
        transports: ['websocket'],
    });
    const username = data[0].user.userName;
    const room = [username, currentUser.userName].sort().toString();
    const [error, setError] = useState('');
    const [msg, setMsg] = useState([]);
    const [composeMsg, setComposeMsg] = useState('');

    useEffect(() => {
        socket.emit('join', { username: currentUser.userName, room, id }, (err) => {
            setError(err);
        });
    }, []);

    socket.on('message', (message) => {
        console.log(message);
        setMsg((prev) => [...prev, message]);
    });

    const { doRequest } = useRequest({
        url: '/api/chats',
        method: 'post',
        body: { username: currentUser.userName, text: composeMsg, room },
        onSuccess: () => {},
    });

    const onSubmit = async (e) => {
        e.preventDefault();

        await doRequest();

        socket.emit('sendMessage', { message: composeMsg, id, room }, (error) => {
            setComposeMsg('');
            if (error) {
                return console.log(error);
            }
            console.log('Message delivered');
        });
    };

    return (
        <div>
            <div className='chat'>
                <div id='messages' className='chat__messages'>
                    <div className='message'>
                        {msg.map((message) => (
                            <div key={message.createdAt}>
                                <p>
                                    <span className='message__name'>{message.username}</span>
                                    <span className='message__meta'>
                                        {moment(message.createdAt).format('h:mm a')}
                                    </span>
                                </p>
                                <p>{message.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='compose'>
                    <form id='message-form' onSubmit={onSubmit}>
                        <input
                            name='message'
                            placeholder='message'
                            required
                            autoComplete='off'
                            value={composeMsg}
                            onChange={(e) => setComposeMsg(e.target.value)}
                        />
                        <button>Send</button>
                    </form>
                </div>
            </div>
            {error}
        </div>
    );
};

ChatWindow.getInitialProps = async (context, client) => {
    const { userId } = context.query;
    const { data } = await client.get(`/api/books/user/${userId}`);
    // const { chats } = await client.get(`/api/chats`);

    return { data };
};

export default ChatWindow;
