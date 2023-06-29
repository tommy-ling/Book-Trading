import { useEffect } from 'react';
import Router from 'next/router';
import Link from 'next/link';

const LandingPage = ({ currentUser, books }) => {
    useEffect(() => {
        if (!currentUser) {
            Router.push('/auth/signup');
        }
    }, []);
    const onClick = () => {
        Router.push('/books/new');
    };

    const bookList = books.map((book) => {
        return (
            <tr key={book.id}>
                <td>
                    <Link href='/books/[bookid]' as={`/books/${book.id}`}>
                        {book.title}
                    </Link>
                </td>
                <td>
                    name: {book.user.name}; userName: {book.user.userName}
                </td>
                <td>{book.user.city}</td>
                <td>{book.requestId.length}</td>
                <td>
                    <Link href='/requests/[bookId]' as={`/requests/${book.id}`}>
                        {' '}
                        Make Request
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <div>
                <h1>All Books</h1>
                <button onClick={onClick} className='btn btn-primary'>
                    Add your books here
                </button>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>User</th>
                            <th>User Location</th>
                            <th>Number of requests</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>{bookList}</tbody>
                </table>
            </div>
        </div>
    );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/books/');
    return { books: data };
};

export default LandingPage;
