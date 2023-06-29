import axios from 'axios';
import { useState } from 'react';

export const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            setErrors(
                <div className='alert alert-danger'>
                    <h4>Oops...</h4>
                    <ul className='my-0'>
                        <li key={err.message}>{err.response.data.message}</li>
                    </ul>
                </div>
            );
        }
    };

    return { errors, doRequest };
};
