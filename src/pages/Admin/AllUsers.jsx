import React from 'react';
import PlaceholderPage from '../PlaceholderPage';
import { People, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AllUsers = () => {
  const navigate = useNavigate();
  return (
    <PlaceholderPage
      title="All Users"
      description="Manage all users in the system. Admin access required."
      icon={People}
      actions={[
        { label: 'Add User', icon: <PersonAdd />, variant: 'outlined', onClick: () => navigate('/admin/users/new') },
      ]}
    />
  );
};

export default AllUsers;
