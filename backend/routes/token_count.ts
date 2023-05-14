import express from 'express';
import { getTokenCount } from '../tokenizer.js';

const router = express.Router();

router.post('/api/count_tokens', async (req, res) => {
	const { text } = req.body;
	if (!text) {
		res.status(200).json({ token_count: 0 });
		return;
	}
	const token_count = getTokenCount(text);
	res.status(200).json({ token_count });
});
export default router;
