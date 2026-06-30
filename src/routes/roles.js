const express = require('express');
const router = express.Router();
const controller = require('../controllers/roles.controller');
const { validateZod } = require('../middlewares/validateZod');
const { requireAuth } = require('../middlewares/authMiddleware');
const { numericIdParam } = require('../validators/commonSchemas');
const { createRolSchema, updateRolSchema } = require('../validators/domainSchemas');

/**
 * @openapi
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario
 */

/**
 * @openapi
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Listar todos los roles
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de roles
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags: [Roles]
 *     summary: Crear un nuevo rol
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rolusr_nm]
 *             properties:
 *               rolusr_nm:
 *                 type: string
 *                 maxLength: 30
 *                 example: "Administrador"
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/',    controller.list);
router.post('/',   validateZod({ body: createRolSchema }), controller.create);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Obtener un rol por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rol encontrado
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     tags: [Roles]
 *     summary: Actualizar un rol
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rolusr_nm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Roles]
 *     summary: Eliminar un rol
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Rol eliminado
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id',    validateZod({ params: numericIdParam }), controller.getById);
router.put('/:id',    validateZod({ params: numericIdParam, body: updateRolSchema }), controller.update);
router.delete('/:id', validateZod({ params: numericIdParam }), controller.remove);

module.exports = router;
