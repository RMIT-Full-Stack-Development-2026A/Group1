import { CountriesService } from '../services/countries.service.js';

export const CountriesController = {
    // [GET] /countries endpoint
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

    // [GET] /countries/:name/flag endpoint
    getCountryFlag: async (req, res, next) => {
        try {
            const { name } = req.params;
            const flag = await CountriesService.getCountryFlag(name);

            return res.status(200).json({
                data: flag,
                message: 'Country flag fetched successfully.',
            });
        } catch (error) {
            return next(error);
        }
    },
};