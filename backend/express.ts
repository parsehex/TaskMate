import { Request, Response, NextFunction } from 'express';
import { validationResult, matchedData } from 'express-validator';

export const validateRequest = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	req.body = matchedData(req);
	next();
};
