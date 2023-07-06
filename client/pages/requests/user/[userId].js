import Router from 'next/router';
import Link from 'next/link';
import { useRequest } from '../../../hooks/useRequest';

const RequestsShowMine = ({ requests, requestsReceived, allRequests, currentUser }) => {
    const myRequestList = requests
        .filter(
            (request) =>
                request.toBook.currentStatus !== 'confirmed' && request.fromBook.currentStatus !== 'confirmed'
        )
        .map((request) => {
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
                    <td>{request.currentStatus}</td>
                    <td>
                        <button onClick={onDeleteClick} className='btn btn-outline-danger py-0'>
                            Delete
                        </button>
                    </td>
                </tr>
            );
        });
    const requestToMeList = requestsReceived
        .filter(
            (request) =>
                request.toBook.currentStatus !== 'confirmed' && request.fromBook.currentStatus !== 'confirmed'
        )
        .map((request) => {
            const { doRequest } = useRequest({
                url: `/api/requests/${request.id}`,
                method: 'delete',
                body: {},
                onSuccess: () => Router.reload(),
            });
            const { doRequest: matchRequest } = useRequest({
                url: `/api/requests/match`,
                method: 'post',
                body: { id: request.id },
                onSuccess: () => {
                    Router.reload();
                },
            });
            const onDeleteClick = () => {
                doRequest();
            };

            const onConfirmClick = () => {
                matchRequest();
            };

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

    const requestsMatched = allRequests
        .filter((request) => request.currentStatus === 'confirmed')
        .filter((request) => request.fromUser.id === currentUser.id || request.toUser.id === currentUser.id)
        .map((request) => {
            const { doRequest } = useRequest({
                url: '/api/requests/matchcancel',
                method: 'post',
                body: { id: request.id },
                onSuccess: () => Router.reload(),
            });

            const onCancelClick = () => {
                doRequest();
            };

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
                        <button onClick={onCancelClick} className='btn btn-outline-danger py-0'>
                            Cancel
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
            <div>
                <h1>Requests Matched</h1>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Book Requested</th>
                            <th>Book Given</th>
                            <th>From User</th>
                            <th>Cancel</th>
                        </tr>
                    </thead>
                    <tbody>{requestsMatched}</tbody>
                </table>
            </div>
        </div>
    );
};

RequestsShowMine.getInitialProps = async (context, client) => {
    const { userId } = context.query;
    const { data } = await client.get(`/api/requests/user/${userId}`);
    const { data: requestsReceived } = await client.get(`/api/requests/received/${userId}`);
    const { data: allRequests } = await client.get(`/api/requests`);

    return { requests: data, requestsReceived, allRequests };
};

export default RequestsShowMine;
