import React from 'react';
import PlaceholderPage from '../PlaceholderPage';
import { Security } from '@mui/icons-material';

const Credentials = () => {
  return (
    <PlaceholderPage
      title="Credentials"
      description="Manage system credentials and security settings. Admin access required."
      icon={Security}
    />
  );
};

export default Credentials;
