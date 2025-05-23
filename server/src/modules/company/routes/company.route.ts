import { Router } from 'express';
import CompanyController from '../controllers/company.controller';

const companyRouter = Router();

companyRouter.post('/', CompanyController.createCompanyController);
companyRouter.get('/', CompanyController.getAllCompaniesController);
companyRouter.get('/:companyId', CompanyController.getCompanyInfoController);
companyRouter.patch('/:companyId', CompanyController.updateCompanyController);
companyRouter.delete('/:companyId', CompanyController.deleteCompanyController);

export default companyRouter;
