// authClient.js

// Login function
async function login(username, password) {
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store the token in localStorage (or use a more secure method in production)
    localStorage.setItem('authToken', data.access_token);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Access protected resource
async function fetchProtectedData() {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch protected data');
    }

    return data;
  } catch (error) {
    console.error('Protected data fetch error:', error);
    throw error;
  }
}

// Example usage
async function exampleUsage() {
  try {
    // Login first
    await login('user1', 'password1');
    console.log('Login successful!');

    // Then access protected resource
    const protectedData = await fetchProtectedData();
    console.log('Protected data:', protectedData);
  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// Uncomment to test
// exampleUsage();
