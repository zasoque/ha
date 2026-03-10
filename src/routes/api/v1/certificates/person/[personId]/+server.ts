import { query } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/v1/certificates/person/{personId}:
 *   get:
 *     summary: Get certificates for a specific person.
 *     description: Retrieve all certificates associated with a given person ID.
 *     tags:
 *       - Certificates
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the person whose certificates are being retrieved.
 *     responses:
 *       200:
 *         description: A list of certificates for the specified person.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 certificates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: string
 *                         example: "123456789012345678"
 *                         description: The ID of the user associated with the certificate.
 *                       type:
 *                         type: string
 *                         example: "건축"
 *                         description: The type of certificate (e.g., "건축", "토목").
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00Z"
 *                         description: The timestamp when the certificate was created.
 *       500:
 *         description: Internal server error if the database query fails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve certificates
 *                 details:
 *                   type: object
 */
export const GET: RequestHandler = async ({ params }) => {
	const { personId } = params;

	const certificates = await query(`SELECT * FROM certificates WHERE user_id = ?`, [personId]);

	return json({ success: true, certificates });
};
