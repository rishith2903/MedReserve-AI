import PlaceholderPage from '../PlaceholderPage';
import { People } from '@mui/icons-material';

const AllDoctors = () => {
  return (
    <PlaceholderPage
      title="All Doctors"
      description="Manage all doctors in the system. Admin access required."
      icon={People}
    />
  );
};

export default AllDoctors;
