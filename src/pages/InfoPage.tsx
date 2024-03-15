import { Typography, Container, Grid, Paper } from '@mui/material'
import { styled } from '@mui/system';

// Define custom styles using the styled function
const CoolRoutesContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5', // Custom background color
  borderRadius: 8, // Rounded corners
}));

export default function InfoPage() {

  // TOOD: add info to this page
  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>Welcome to Cool Routes</Typography>
      
      <Paper>
        <Typography gutterBottom>
          Welcome to Cool Routes, an innovative project designed to enhance walkability within the Arizona State University (ASU) campus by leveraging Mean Radiant Temperature (MRT) data. Our mission is to provide the university community comfortable walking routes that consider thermal comfort, especially under the hot sun in Tempe. By prioritizing well-being alongside convenience, Cool Routes aims to promote a healthier, more sustainable campus environment.
        </Typography>
      </Paper>

      <Typography variant="h5" align="center" gutterBottom>What is Mean Radiant Temperature (MRT)?</Typography>
      
      <Paper>
        <Typography gutterBottom>
          Mean Radiant Temperature (MRT) is crucial in determining thermal comfort outdoors. It represents the average temperature of all surfaces surrounding a person, taking into account direct and reflected solar radiation as well as the ambient air temperature. MRT is significant because it influences how warm or cool a person feels in a given environment, beyond what air temperature alone can tell us.
        </Typography>
      </Paper>
  </Container>
  )
}
