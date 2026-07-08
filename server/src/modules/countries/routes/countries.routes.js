import express from 'express';
import { CountriesController } from '../controllers/countries.controller.js';

const countriesRoutes = express.Router();

/**
 * @openapi
 * /api/v1/countries:
 *  get:
 *      tags: [Countries]
 *      summary: Get a list of all countries
 *      description: Fetches a formatted and cached list of countries including their common names and flag URLs/emojis.
 *      responses:
 *          200:
 *              description: Countries fetched successfully.
 */
countriesRoutes.get('/', CountriesController.getCountries);

/**
 * @openapi
 * /api/v1/countries/{name}/flag:
 *  get:
 *      tags: [Countries]
 *      summary: Get flag details for a specific country
 *      parameters:
 *        - in: path
 *          name: name
 *          required: true
 *          schema:
 *              type: string
 *              description: Common name of the country 
 *      responses:
 *        200:
 *          description: Country flag fetched successfully.
 *        404:
 *          $ref: '#/components/responses/NotFoundResponse'
 */
countriesRoutes.get('/:name/flag', CountriesController.getCountryFlag);

export default countriesRoutes;