import { useState } from 'react';
import Router from 'next/router';
import { useRequest } from '../../hooks/useRequest';

const AddNewRequest = ({ books, book, myBooks, currentUser }) => {
    const [bookId, setBookId] = useState('');

    const myOwnBook = book.user.id === currentUser.id;

    const { errors, doRequest } = useRequest({
        url: '/api/requests',
        method: 'post',
        body: myOwnBook
            ? { fromBookId: book.id, toBookId: bookId }
            : { fromBookId: bookId, toBookId: book.id },
        onSuccess: () => Router.push('/'),
    });

    const onRequestClick = () => {
        doRequest();
    };

    const booksToChooseFrom = myOwnBook
        ? books.filter((book) => book.user.id !== currentUser.id)
        : myBooks.filter((book) => book.currentStatus !== 'confirmed');

    const booksList = booksToChooseFrom.map((book) => {
        return (
            <option key={book.id} value={book.id}>
                {book.title}
            </option>
        );
    });

    const dropDownList = (
        <select
            value={bookId}
            onChange={(e) => {
                setBookId(e.target.value);
            }}
            className='form-select'
            aria-label='Default select example'
        >
            <option>Choose one Book</option>
            {booksList}
        </select>
    );

    return (
        <div>
            {myOwnBook ? (
                <div>
                    <h3>Giving {book.title}. Choose the book you want to get:</h3>
                    {dropDownList}
                </div>
            ) : (
                <div>
                    <h3>Getting {book.title}. Choose the book you want to give:</h3>
                    {dropDownList}
                </div>
            )}
            <button onClick={onRequestClick} className='btn btn-primary my-3'>
                Confirm request
            </button>
            {errors}
        </div>
    );
};

AddNewRequest.getInitialProps = async (context, client, currentUser) => {
    const { bookId } = context.query;
    const { data: bookData } = await client.get(`/api/books/${bookId}`);
    const { data: booksData } = await client.get('/api/books/');
    const { data: myBooksData } = await client.get(`/api/books/user/${currentUser.id}`);

    return { books: booksData, book: bookData, myBooks: myBooksData };
};

export default AddNewRequest;
