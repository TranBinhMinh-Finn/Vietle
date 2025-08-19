import { format } from 'maplibre-gl';
import provinceIdMapping from './assets/gis/merged/id_mapping.json';

export const getProvinceNameById = (id) => {
  return provinceIdMapping[id];
};

export const getProvinceIdByName = (name) => {
    for(const [key, value] of Object.entries(provinceIdMapping)) {
        if(value == name)
            return key;
    }
    return null;
};

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

export const GameModes = {
  DAILY: 0,
  PRACTICE: 1
}

export const getDateInTimezone = (timezone = 'Asia/Ho_Chi_Minh') => {
  const today = new Date();
  const options = {
    timezone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  };
  const formatter = new Intl.DateTimeFormat('vi-VN', options);
  return formatter.format(today);
} 

export const getTodaysSeed = (timezone = 'Asia/Ho_Chi_Minh') => {
  const today = new Date();
  const options = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = Intl.DateTimeFormat('vi-VN', options);
  const dateInTimezone = formatter.format(today);
  const dateString = dateInTimezone.replace(/\//g, '');
  return parseInt(dateString);
}

export const RNG = (seed) => {
  var m = 2**35 - 31;
  var a = 185852;
  var s = seed % m;
  return (s * a % m) / m;
}