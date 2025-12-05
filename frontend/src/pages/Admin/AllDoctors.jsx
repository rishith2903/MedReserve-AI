import PlaceholderPage from '../PlaceholderPage';
import { People, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AllDoctors = () => {
  const navigate = useNavigate();
  return (
    <PlaceholderPage
      title="All Doctors"
      description="Manage all doctors in the system. Admin access required."
      icon={People}
      actions={[
        { label: 'Add Doctor', icon: <PersonAdd />, variant: 'outlined', onClick: () => navigate('/admin/doctors/new') },
      ]}
    />
  );
};

export default AllDoctors;
