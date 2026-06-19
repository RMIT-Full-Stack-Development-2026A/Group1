import { CountriesService } from '../services/countries.service.js';

export const CountriesController = {
    getCountries: async (req, res, next) => {
        try {
            const countries = await CountriesService.getCountries();

            return res.status(200).json({
                data: countries,
                message: 'Countries fetched successfully.',
            });
        } catch (error) {
            return next(error);
        }
    },

    getCountryFlag: async (req, res, next) => {
        try {
            const { countryName } = req.params;
            const flag = await CountriesService.getCountryFlag(countryName);

            return res.status(200).json({
                data: flag,
                message: 'Country flag fetched successfully.',
            });
        } catch (error) {
            return next(error);
        }
    },
};