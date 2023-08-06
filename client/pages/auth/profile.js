import { useState } from 'react';
import Router from 'next/router';
import { useRequest } from '../../hooks/useRequest';

const MyProfile = ({ currentUser }) => {
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [password, setPassword] = useState('');
    const [pwBtnClicked, setPwBtnClicked] = useState(false);
    const [cityBtnClicked, setCityBtnClicked] = useState(false);
    const [nameBtnClicked, setNameBtnClicked] = useState(false);

    const pwBtn = !pwBtnClicked ? (
        'Edit'
    ) : (
        <input type='password' onChange={(e) => setPassword(e.target.value)} value={password} />
    );
    const cityBtn = !cityBtnClicked ? (
        'Edit'
    ) : (
        <input onChange={(e) => setCity(e.target.value)} value={city} />
    );
    const nameBtn = !nameBtnClicked ? (
        'Edit'
    ) : (
        <input onChange={(e) => setName(e.target.value)} value={name} />
    );

    const { errors: updateErrors, doRequest: doUpdateRequest } = useRequest({
        url: '/api/users/update',
        method: 'put',
        body: { name, city, password },
        onSuccess: () => {
            Router.push('/auth/profile');
            setPwBtnClicked(false);
            setNameBtnClicked(false);
            setCityBtnClicked(false);
        },
    });
    const { errors: deleteErrors, doRequest: doDeleteRequest } = useRequest({
        url: `/api/users/${currentUser.id}`,
        method: 'delete',
        body: '',
        onSuccess: () => Router.push('/'),
    });

    const onConfirmClick = (e) => {
        e.preventDefault();
        doUpdateRequest();
    };

    const onDeleteClick = (e) => {
        e.preventDefault();
        doDeleteRequest();
    };

    return (
        <div className='container text-center'>
            <div className='row row-cols-1'>
                <div className='col'>
                    <p className='display-6'>{currentUser.name}'s profile</p>
                </div>
            </div>
            <div className='row row-cols-3'>
                <div className='col my-3'>
                    <strong>Username</strong>
                </div>
                <div className='col my-3'>{currentUser.userName}</div>
                <div className='col my-3' />
                <div className='col my-3'>
                    <strong>Name</strong>
                </div>
                <div className='col my-3'>{currentUser.name}</div>
                <button
                    className='col my-3 btn btn-secondary p-0 w-25'
                    onClick={() => setNameBtnClicked(true)}
                >
                    {nameBtn}
                </button>
                <div className='col my-3'>
                    <strong>City</strong>
                </div>
                <div className='col my-3'>{currentUser.city}</div>
                <button
                    className='col my-3 btn btn-secondary p-0 w-25'
                    onClick={() => setCityBtnClicked(true)}
                >
                    {cityBtn}
                </button>
                <div className='col my-3'>
                    <strong>Email</strong>
                </div>
                <div className='col my-3'>{currentUser.email}</div>
                <div className='col my-3' />
                <div className='col my-3'>
                    <strong>Password</strong>
                </div>
                <div className='col my-3'>***Confidential***</div>
                <button className='col my-3 btn btn-secondary p-0 w-25' onClick={() => setPwBtnClicked(true)}>
                    {pwBtn}
                </button>
            </div>
            <button className='btn btn-primary' onClick={onConfirmClick}>
                Confirm Changes
            </button>
            <button className='btn btn-outline-danger mx-3' onClick={onDeleteClick}>
                Delete Profile
            </button>
            {updateErrors}
            {deleteErrors}
        </div>
    );
};

export default MyProfile;
