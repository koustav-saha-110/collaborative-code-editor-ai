import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket, initializeSocket } from '../socket/socket.server';
import { v4 as uuid } from 'uuid';

/**
 * HomePage
 * 
 * This component renders a form which allows the user to input a Code (RoomId) and a Username.
 * When the form is submitted, the user is redirected to a new path `/editor/${roomId}/${username}` which
 * renders the EditorPage component.
 * 
 * The user is also given an option to generate a new RoomId by clicking on the "Create new RoomId" button.
 * When this button is clicked, a new RoomId is generated and the input field is populated with this new RoomId.
 * 
 * This component also initializes the socket connection by calling the `initializeSocket()` function from the
 * `socket.server` module in the `useEffect()` hook.
 */
const HomePage = () => {

    // States
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    // Handlers
    const submitHandler = (e) => {
        e.preventDefault();

        if (!roomId || !username) {
            toast.error('Both Code (RoomId) and Username are required');
            return;
        }

        navigate(`/editor/${roomId}/${username}`);
    }

    const createNewRoomHandler = () => {
        const roomId = uuid();
        setRoomId(roomId);
    }

    useEffect(() => {
        try {
            disconnectSocket();
            initializeSocket();
        } catch (error) {
            toast.error(error.message);
        }
    }, []);

    return (
        <React.Fragment>
            <section className='flex justify-center items-center h-screen px-2 md:px-10'>
                <form onSubmit={submitHandler} className='flex flex-col sm:w-1/2 md:w-1/3 lg:w-1/4 p-6 rounded-lg bg-white border border-gray-300 shadow-md'>
                    <h1 className='text-2xl font-medium'>Join a Room</h1>
                    <div className='flex flex-col gap-2 mt-6'>
                        <label htmlFor="roomId" className='text-sm font-medium'>Enter Code (RoomId)</label>
                        <input value={roomId} onChange={(e) => {
                            setRoomId(e.target.value);
                        }} type="text" id='roomId' name='roomId' className='border border-gray-300 p-2 outline-none rounded-lg w-full' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="username" className='text-sm font-medium'>Username</label>
                        <input value={username} onChange={(e) => {
                            setUsername(e.target.value);
                        }} type="text" id='username' name='username' className='border border-gray-300 p-2 outline-none rounded-lg w-full' />
                    </div>
                    <div className='flex gap-2 mt-4'>
                        <button type='submit' className='bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md'>Join</button>
                        <p onClick={createNewRoomHandler} className='bg-green-500 hover:bg-green-700 text-white text-center font-medium py-2 px-4 rounded-md'>Create new RoomId</p>
                    </div>
                </form>
            </section>
        </React.Fragment>
    );
}

export default HomePage;
