import { useState } from 'react';
import { io } from 'socket.io-client';

const ChatWindow = ({ data, currentUser }) => {
    const socket = io('/chat', {
        reconnection: true,
        transports: ['websocket'],
    });
    const username = data[0].user.userName;
    const roomId = [username, currentUser.userName].sort().toString();
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [composeMsg, setComposeMsg] = useState('');

    socket.emit('join', { username: currentUser.userName, room: roomId }, (err) => {
        setError(err);
    });

    socket.on('message', (message) => {
        console.log(message.text);
        setMsg(message.text);
    });

    console.log(data[0].user.userName, currentUser);
    return (
        <div>
            <div className='chat'>
                <div id='messages' className='chat__messages'>
                    <div className='message'>
                        <p>
                            <span className='message__name'>username</span>
                            <span className='message__meta'>createdAt</span>
                        </p>
                        <p>{msg}</p>
                    </div>
                </div>

                <div className='compose'>
                    <form id='message-form'>
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

    return { data };
};

export default ChatWindow;
