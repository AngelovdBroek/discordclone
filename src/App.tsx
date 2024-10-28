import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import ChatLayout from './components/ChatLayout';
import { useUsers, User } from './store/users';
import { useMessages } from './store/messages';

// Simulated user database for discriminator checking
const existingUsers: Record<string, string[]> = {};

function generateUniqueDiscriminator(username: string): string {
  const existingDiscriminators = existingUsers[username] || [];
  let discriminator: string;
  
  do {
    discriminator = Math.floor(1000 + Math.random() * 9000).toString();
  } while (existingDiscriminators.includes(discriminator));

  if (!existingUsers[username]) {
    existingUsers[username] = [];
  }
  existingUsers[username].push(discriminator);
  
  return discriminator;
}

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { addUser, updateUser, getUser, getAllUsers, deleteUser } = useUsers();
  const { deleteUserMessages } = useMessages();

  const handleSubmit = (formData: { username: string; email: string; password: string }) => {
    // For login, find existing user
    if (isLogin) {
      const existingUser = getAllUsers().find(u => u.email === formData.email);
      if (existingUser) {
        // Set all other users to offline
        getAllUsers().forEach(user => {
          if (user.id !== existingUser.id && user.status === 'online') {
            updateUser(user.id, { status: 'offline' });
          }
        });
        
        // Set current user to online
        const updatedUser = { ...existingUser, status: 'online' };
        updateUser(existingUser.id, { status: 'online' });
        setCurrentUser(updatedUser);
        setIsAuthenticated(true);
      } else {
        alert('User not found. Please register first.');
      }
      return;
    }

    // For registration
    const discriminator = generateUniqueDiscriminator(formData.username);
    const newUser: User = {
      id: Date.now().toString(),
      displayName: formData.username,
      username: formData.username,
      discriminator,
      email: formData.email,
      bio: '',
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      banner: '',
      accentColor: '#5865f2',
      effect: null,
      decoration: null,
      memberSince: new Date(),
      status: 'online'
    };

    // Set all other users to offline
    getAllUsers().forEach(user => {
      if (user.status === 'online') {
        updateUser(user.id, { status: 'offline' });
      }
    });

    addUser(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    if (!currentUser) return;
    
    // If display name is changing, generate new discriminator
    if (userData.displayName && userData.displayName !== currentUser.displayName) {
      const newDiscriminator = generateUniqueDiscriminator(userData.displayName);
      // Remove old discriminator from existing users
      const oldDiscriminators = existingUsers[currentUser.username] || [];
      existingUsers[currentUser.username] = oldDiscriminators.filter(d => d !== currentUser.discriminator);
      
      userData = {
        ...userData,
        username: userData.displayName,
        discriminator: newDiscriminator
      };
    }
    
    updateUser(currentUser.id, userData);
    setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const handleLogout = () => {
    if (currentUser) {
      updateUser(currentUser.id, { status: 'offline' });
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
      deleteUser(currentUser.id);
      deleteUserMessages(currentUser.id);
      handleLogout();
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  if (isAuthenticated && currentUser) {
    // Get all users except current user
    const otherUsers = getAllUsers().filter(u => u.id !== currentUser.id);
    
    return (
      <ChatLayout 
        user={currentUser} 
        onUpdateUser={handleUpdateUser} 
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        allUsers={[currentUser, ...otherUsers]} // Include current user in the list
      />
    );
  }

  return (
    <AuthForm 
      type={isLogin ? 'login' : 'register'} 
      onSubmit={handleSubmit}
      onToggle={toggleAuthMode}
    />
  );
}

export default App;