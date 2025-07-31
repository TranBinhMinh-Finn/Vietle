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