import Router from 'next/router';
import { useRequest } from '../../hooks/useRequest';

const BookShowOne = ({ book, currentUser }) => {
    const { errors, doRequest } = useRequest({
        url: `/api/books/${book.id}`,
        method: 'delete',
        body: '',
        onSuccess: () => Router.push('/books/user/[userId]', `/books/user/${book.user.id}`),
    });
    const onDeleteClick = () => {
        doRequest();
    };
    return (
        <div>
            <h1>{book.title}</h1>
            <h4>User: {book.user.name}</h4>
            <button
                onClick={() => {
                    Router.push('/requests/[bookId]', `/requests/${book.id}`);
                }}
                className='btn btn-primary'
            >
                Exchange this book
            </button>
            {book.user.id === currentUser.id ? (
                <button onClick={onDeleteClick} className='btn btn-outline-danger mx-3'>
                    Delete this book
                </button>
            ) : null}
            {errors}
        </div>
    );
};

BookShowOne.getInitialProps = async (context, client) => {
    const { bookId } = context.query;
    const { data } = await client.get(`/api/books/${bookId}`);

    return { book: data };
};

export default BookShowOne;
