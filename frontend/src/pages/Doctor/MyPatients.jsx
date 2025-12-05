import PlaceholderPage from '../PlaceholderPage';
import { People } from '@mui/icons-material';

const MyPatients = () => {
  return (
    <PlaceholderPage
      title="My Patients"
      description="Manage your patients and their medical records. Doctor access required."
      icon={People}
    />
  );
};

export default MyPatients;
