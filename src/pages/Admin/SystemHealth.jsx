import { Container } from '@mui/material';
import APIStatusDashboard from '../../components/admin/APIStatusDashboard';

const SystemHealth = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <APIStatusDashboard />
    </Container>
  );
};

export default SystemHealth;
