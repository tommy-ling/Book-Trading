import Link from 'next/link';
import Router from 'next/router';

const BookShowMine = ({ books }) => {
    const bookList = books.map((book) => {
        return (
            <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.requestId.length}</td>
                <td>
                    <Link href='/books/[bookId]' as={`/books/${book.id}`}>
                        View
                    </Link>
                </td>
            </tr>
        );
    });

    const onClick = () => {
        Router.push('/books/new');
    };

    return (
        <div>
            <div>
                <h1>My Books</h1>
                <button onClick={onClick} className='btn btn-primary'>
                    Add new books here
                </button>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Title</th>
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

BookShowMine.getInitialProps = async (context, client) => {
    const { userId } = context.query;
    const { data } = await client.get(`/api/books/user/${userId}`);

    return { books: data };
};

export default BookShowMine;
