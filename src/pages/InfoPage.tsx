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

      <Typography variant="h5" align="center" gutterBottom>Heat Load and Solar Radiation</Typography>
      
      <Paper>
        <Typography gutterBottom>
        Thermal Comfort: It provides a more comprehensive understanding of comfort levels outdoors, considering both heat and sunlight exposure.
        Health and Well-being: By highlighting cooler routes, we can reduce heat stress and improve the overall outdoor experience.
        Sustainability: Encouraging walkability through comfortable routes supports a more sustainable, less car-dependent campus.
        </Typography>
      </Paper>

      <Typography variant="h5" align="center" gutterBottom>Interpreting MRT for Thermal Comfort</Typography>

      <Paper>
        <Typography gutterBottom>
        Thermal comfort is subjective and varies from person to person. However, routes with lower MRT values are generally more comfortable in hot conditions, as they reduce the heat load on individuals. Our system uses MRT data to suggest routes that strike a balance between being short and thermally comfortable.
        </Typography>
      </Paper>

      <Typography variant="h5" align="center" gutterBottom>The SOLWEIG Model</Typography>

      <Paper>
        <Typography gutterBottom>
        Our project utilizes the SOLWEIG model to simulate and analyze the spatial variations of MRT throughout the ASU campus. This model helps us understand how different urban geometries and surface materials affect thermal comfort. Note that we do not require users to understand the model setup but rather provide this information for transparency.
        </Typography>
      </Paper>

      <Typography variant="h5" align="center" gutterBottom>User Guide</Typography>

      <Paper>
        <Typography gutterBottom>
        Accessing Routes: Navigate to our system through the Cool Routes website. Enter your starting point and destination within the ASU campus.
        Route Selection: The system will present you with route options, highlighting the recommended route based on optimal thermal comfort.
        Understanding Elements: Hover over or click on various interface elements for tooltips and detailed explanations on how to make the most of Cool Routes.
        </Typography>
      </Paper>
  </Container>
  )
}
