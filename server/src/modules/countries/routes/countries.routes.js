import express from 'express';
import { CountriesController } from '../controllers/countries.controller.js';

const countriesRoutes = express.Router();

countriesRoutes.get('/', CountriesController.getCountries);
countriesRoutes.get('/:countryName/flag', CountriesController.getCountryFlag);

export default countriesRoutes;