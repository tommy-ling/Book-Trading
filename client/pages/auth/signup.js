import { useState } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { useRequest } from '../../hooks/useRequest';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [userName, setUserName] = useState('');

    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email,
            password,
            name,
            city,
            userName,
        },
        onSuccess: () => Router.push('/'),
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        await doRequest();
    };

    return (
        <form onSubmit={onSubmit}>
            <h1>Sign Up</h1>
            <h3>
                Have an account? <Link href='/auth/signin'>Sign in here</Link>
            </h3>
            <div className='form-group'>
                <label>Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className='form-control' />
            </div>
            <div className='form-group'>
                <label>Password</label>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    className='form-control'
                />
            </div>
            <div className='form-group'>
                <label>City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className='form-control' />
            </div>
            <div className='form-group'>
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className='form-control' />
            </div>
            <div className='form-group'>
                <label>Username</label>
                <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className='form-control'
                />
            </div>
            {errors}
            <button className='btn btn-primary'>Sign Up</button>
        </form>
    );
};

export default SignUp;
