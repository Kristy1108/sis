import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

const TestForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [encryptedPassword, setEncryptedPassword] = useState('');
    const [decryptedPassword, setDecryptedPassword] = useState('');

    const handleEncrypt = () => {
        const encrypted = CryptoJS.AES.encrypt(password, 'secret key 123').toString();
        setEncryptedPassword(encrypted);
        setDecryptedPassword('');
    };

    const handleDecrypt = () => {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'secret key 123');
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
        setDecryptedPassword(originalPassword);
    };

    return (
        <div>
            <form>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="button" onClick={handleEncrypt}>Submit</button>
            </form>
            {encryptedPassword && (
                <div>
                    <p>Username: {username}</p>
                    <p>Encrypted Password: {encryptedPassword}</p>
                    <button onClick={handleDecrypt}>Decrypt Password</button>
                </div>
            )}
            {decryptedPassword && (
                <div>
                    <p>Decrypted Password: {decryptedPassword}</p>
                </div>
            )}
        </div>
    );
};

export default TestForm;