import Button from '@mui/material/Button'

export default function InfoPage() {
  // TOOD: add info to this page
  return (
    <div className="cool-routes-container">
      <h1>Welcome to Cool Routes</h1>
      <p>
        Welcome to Cool Routes, an innovative project designed to enhance walkability within the Arizona State University (ASU) campus by leveraging Mean Radiant Temperature (MRT) data. Our mission is to provide the university community comfortable walking routes that consider thermal comfort, especially under the hot sun in Tempe. By prioritizing well-being alongside convenience, Cool Routes aims to promote a healthier, more sustainable campus environment.
      </p>
      <h2>What is Mean Radiant Temperature (MRT)?</h2>
      <p>
        Mean Radiant Temperature (MRT) is crucial in determining thermal comfort outdoors. It represents the average temperature of all surfaces surrounding a person, taking into account direct and reflected solar radiation as well as the ambient air temperature. MRT is significant because it influences how warm or cool a person feels in a given environment, beyond what air temperature alone can tell us.
      </p>
      <h2>Heat Load and Solar Radiation</h2>
      <p>
        The sun's radiation contributes significantly to the heat load experienced by individuals outdoors. This load varies depending on factors like the time of day, cloud cover, and the presence of reflective surfaces. Understanding this heat load is essential for assessing thermal comfort accurately.
      </p>
      <h2>Why MRT is Important</h2>
      <ul>
        <li>Thermal Comfort: It provides a more comprehensive understanding of comfort levels outdoors, considering both heat and sunlight exposure.</li>
        <li>Health and Well-being: By highlighting cooler routes, we can reduce heat stress and improve the overall outdoor experience.</li>
        <li>Sustainability: Encouraging walkability through comfortable routes supports a more sustainable, less car-dependent campus.</li>
      </ul>
      <h2>Interpreting MRT for Thermal Comfort</h2>
      <p>
        Thermal comfort is subjective and varies from person to person. However, routes with lower MRT values are generally more comfortable in hot conditions, as they reduce the heat load on individuals. Our system uses MRT data to suggest routes that strike a balance between being short and thermally comfortable.
      </p>
      <p>[Discrepancy between air temperature and MRT]</p>
      <h2>The SOLWEIG Model</h2>
      <p>
        Our project utilizes the SOLWEIG model to simulate and analyze the spatial variations of MRT throughout the ASU campus. This model helps us understand how different urban geometries and surface materials affect thermal comfort. Note that we do not require users to understand the model setup but rather provide this information for transparency.
      </p>
      <h2>User Guide</h2>
      <ol>
        <li>Accessing Routes: Navigate to our system through the Cool Routes website. Enter your starting point and destination within the ASU campus.</li>
        <li>Route Selection: The system will present you with route options, highlighting the recommended route based on optimal thermal comfort.</li>
        <li>Understanding Elements: Hover over or click on various interface elements for tooltips and detailed explanations on how to make the most of Cool Routes.</li>
      </ol>
      <h2>Feedback</h2>
      <p>
        Your feedback is invaluable to us. Please share your experiences, suggestions, or any issues encountered while using the Cool Routes system. Together, we can make ASU a cooler, more walkable campus for everyone.
      </p>
    </div>
  )
}
