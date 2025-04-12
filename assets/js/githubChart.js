document.addEventListener('DOMContentLoaded', function() {
  // Function to fetch and modify the SVG
  async function modifyGitHubChart() {
    try {
      // Get the GitHub chart element
      const githubChart = document.getElementById('github-chart');
      
      if (!githubChart) return;
      
      // Get the source URL
      const chartUrl = githubChart.src;
      
      // Fetch the SVG content
      const response = await fetch(chartUrl);
      const svgText = await response.text();
      
      // Create a temporary container to parse the SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      
      // Find all rect elements in the SVG (these are the contribution boxes)
      const rects = svgDoc.querySelectorAll('rect');
      
      // Define the light grey color to replace (actual GitHub color)
      const targetColor = '#ebedf0';
      
      // Define the new dark grey color (slightly lighter than before for better contrast)
      const newColor = '#2d333b';  // GitHub dark mode color
      
      // Loop through each rect and change its fill color if it's light grey
      rects.forEach(rect => {
        const fill = rect.getAttribute('fill');
        if (fill && fill.toLowerCase() === targetColor) {
          rect.setAttribute('fill', newColor);
        }
      });
      
      // Get the modified SVG as a string
      const serializer = new XMLSerializer();
      const modifiedSvg = serializer.serializeToString(svgDoc);
      
      // Create a data URL from the modified SVG
      const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create a new image element with the modified SVG
      const newImage = document.createElement('img');
      newImage.id = 'github-chart-modified';
      newImage.src = svgUrl;
      newImage.style.width = '90%';
      newImage.style.borderRadius = '8px';
      newImage.style.opacity = '0';
      newImage.style.transform = 'translateY(20px)';
      newImage.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      
      // Replace the original image with the modified one
      githubChart.style.display = 'none';
      githubChart.parentNode.insertBefore(newImage, githubChart.nextSibling);
      
      // Animate the new image in
      setTimeout(() => {
        newImage.style.opacity = '1';
        newImage.style.transform = 'translateY(0)';
      }, 100);
      
    } catch (error) {
      console.error('Error modifying GitHub chart:', error);
    }
  }
  
  // Run the function
  modifyGitHubChart();
}); 