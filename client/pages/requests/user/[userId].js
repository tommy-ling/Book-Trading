import Router from 'next/router';
import Link from 'next/link';
import { useRequest } from '../../../hooks/useRequest';

const RequestsShowMine = ({ requests, requestsReceived }) => {
    const myRequestList = requests.map((request) => {
        const { doRequest } = useRequest({
            url: `/api/requests/${request.id}`,
            method: 'delete',
            body: {},
            onSuccess: () => Router.reload(),
        });
        const onDeleteClick = () => {
            doRequest();
        };

        return (
            <tr key={request.id}>
                <td>
                    <Link href='/books/[bookid]' as={`/books/${request.fromBook.id}`}>
                        {request.fromBook.title}
                    </Link>
                </td>
                <td>
                    <Link href='/books/[bookid]' as={`/books/${request.toBook.id}`}>
                        {request.toBook.title}
                    </Link>
                </td>
                <td>
                    name: {request.toUser.name}; userName: {request.toUser.userName}; loc:{' '}
                    {request.toUser.city}
                </td>
                <td>{request.status}</td>
                <td>
                    <button onClick={onDeleteClick} className='btn btn-outline-danger py-0'>
                        Delete
                    </button>
                </td>
            </tr>
        );
    });
    const requestToMeList = requestsReceived.map((request) => {
        const { doRequest } = useRequest({
            url: `/api/requests/${request.id}`,
            method: 'delete',
            body: {},
            onSuccess: () => Router.reload(),
        });
        const onDeleteClick = () => {
            doRequest();
        };

        const onConfirmClick = () => {};

        return (
            <tr key={request.id}>
                <td>
                    <Link href='/books/[bookid]' as={`/books/${request.toBook.id}`}>
                        {request.toBook.title}
                    </Link>
                </td>
                <td>
                    <Link href='/books/[bookid]' as={`/books/${request.fromBook.id}`}>
                        {request.fromBook.title}
                    </Link>
                </td>
                <td>
                    name: {request.fromUser.name}; userName: {request.fromUser.userName}; loc:{' '}
                    {request.fromUser.city}
                </td>
                <td>
                    <button onClick={onConfirmClick} className='btn btn-primary py-0'>
                        Confirm
                    </button>
                </td>
                <td>
                    <button onClick={onDeleteClick} className='btn btn-outline-danger py-0'>
                        Delete
                    </button>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <div>
                <h1>Requests I Made</h1>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Book to Give</th>
                            <th>Book to Get</th>
                            <th>To User</th>
                            <th>Status</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>{myRequestList}</tbody>
                </table>
            </div>
            <div>
                <h1>Requests I Received</h1>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Book Requested</th>
                            <th>Book Given</th>
                            <th>From User</th>
                            <th>Confirm</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>{requestToMeList}</tbody>
                </table>
            </div>
        </div>
    );
};

RequestsShowMine.getInitialProps = async (context, client) => {
    const { userId } = context.query;
    const { data } = await client.get(`/api/requests/user/${userId}`);
    const { data: requestsReceived } = await client.get(`/api/requests/received/${userId}`);

    return { requests: data, requestsReceived };
};

export default RequestsShowMine;
