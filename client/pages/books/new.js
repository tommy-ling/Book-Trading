import { useState } from 'react';
import Router from 'next/router';
import { useRequest } from '../../hooks/useRequest';

const AddNewBook = () => {
    const [title, setTitle] = useState('');

    const { doRequest, errors } = useRequest({
        url: '/api/books',
        method: 'post',
        body: { title },
        onSuccess: () => Router.push('/'),
    });

    const onSubmit = (e) => {
        e.preventDefault();
        doRequest();
    };

    return (
        <div>
            <h1>Create a Book</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className='form-control'
                    />
                </div>
                {errors}
                <button className='btn btn-primary'>Submit</button>
            </form>
        </div>
    );
};

export default AddNewBook;
