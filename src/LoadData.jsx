export const loadProvinceData = async () => {
  const allData = [];
  const totalFiles = 34;
  
  console.log('Loading province data...');
  
  for (let i = 1; i <= totalFiles; i++) {
    try {
      const jsonData = await import(`./assets/gis/merged/${i}.json`);
      allData.push(jsonData.default);

    } catch (error) {
      console.error(`Error loading ${i}.json`, error);
    }
  }
  
  console.log(`Successfully loaded ${allData.length} provinces`);
  return allData;
};

export const loadProvinceDataWithRetry = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await loadProvinceData();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error(`Failed to load province data after ${maxRetries} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};