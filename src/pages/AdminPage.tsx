import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <header>
        <h1>Admin Dashboard</h1>
        <p>This is the protected area for administrators.</p>
        <p>You will build the login forms and content management tools here.</p>
      </header>
    </div>
  );
}

// Update the export to match the new component name
export default AdminPage;